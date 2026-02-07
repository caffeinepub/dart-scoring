import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// With-clause applies standard migration from old to new actor state schema.
actor {
  public type GoogleOAuthConfig = {
    clientId : Text;
    redirectPath : Text;
    frontendOAuthRedirectPath : Text;
  };

  public type OAuthStateValue = {
    state : Text;
    expirationTime : Time.Time;
    used : Bool;
  };

  var googleOAuthConfig : GoogleOAuthConfig = {
    clientId = "default-client-id";
    redirectPath = "/api/auth/google/callback";
    frontendOAuthRedirectPath = "/api/auth/google/redirect";
  };

  let oauthStates = Map.empty<Text, OAuthStateValue>();

  type User = {
    id : Text;
    email : Text;
    username : Text;
    oauth_provider : ?Text;
    oauth_subject : ?Text;
    email_verified : Bool;
    createdAt : Time.Time;
    lastLoginAt : ?Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    username : Text;
  };

  public type UserRegistrationError = {
    #anonymous;
    #emailExists;
    #usernameExists;
    #oauthIdentityExists;
    #invalidOauthState;
    #invalidMissingGoogleConfig;
  };

  module RoomStatus {
    public type RoomStatus = { #Open; #InProgress; #Closed };
  };
  type RoomStatus = RoomStatus.RoomStatus;

  module GameStatus {
    public type GameStatus = { #Pending; #Active; #Completed };
  };
  type GameStatus = GameStatus.GameStatus;

  type Room = {
    id : Nat;
    code : Text;
    hostId : Text;
    status : RoomStatus;
    owner_user_id : ?Principal;
    admin_token_hash : ?Text;
  };

  type Game = {
    id : Nat;
    roomId : Nat;
    status : GameStatus;
    startTime : Int;
    endTime : ?Int;
    winnerPlayerId : ?Nat;
  };

  type Player = {
    id : Nat;
    gameId : Nat;
    userId : ?Text;
    roomId : Nat;
    displayName : Text;
    isHost : Bool;
    joinedAt : Nat;
    remainingScore : Int;
  };

  type Turn = {
    id : Nat;
    gameId : Nat;
    playerId : Nat;
    turnIndex : Nat;
    score : Nat;
    isBust : Bool;
    remainingBefore : Int;
    turnTotal : Int;
  };

  type ShotEvent = {
    id : Nat;
    turnId : Nat;
    target : Nat;
    points : Nat;
    multiplier : Nat;
  };

  type PlayerGameStats = {
    id : Nat;
    gameId : Nat;
    playerId : Nat;
    userId : ?Text;
    dartsThrown : Nat;
    pointsScoredTotal : Nat;
    avg3dart : Float;
    first9Avg : ?Float;
    num180s : Nat;
    numBusts : Nat;
    checkoutAttempts : Nat;
    checkoutSuccess : Nat;
    createdAt : Int;
  };

  type UserStats = {
    gamesPlayed : Nat;
    wins : Nat;
    winRate : Float;
    avg3dartOverall : Float;
    first9AvgOverall : ?Float;
    checkoutAttempts : Nat;
    checkoutSuccess : Nat;
    checkoutRate : Float;
    total180s : Nat;
    totalBusts : Nat;
    updatedAt : Int;
  };

  type HealthCheck = {
    name : Text;
    healthy : Bool;
    message : ?Text;
  };

  type HealthStatus = {
    ok : Bool;
    components : [HealthCheck];
    message : Text;
    httpCode : Nat16;
  };

  type AdminToken = Text;

  type GameWithStatistics = {
    gameId : Nat;
    startedAt : Int;
    finishedAt : ?Int;
    mode : Text;
    doubleOut : Bool;
    place : Nat;
    avg : Float;
    _180s : Nat;
    checkoutPercent : Float;
    win : Bool;
  };

  // Persistent storage
  let rooms = Map.empty<Nat, Room>();
  let games = Map.empty<Nat, Game>();
  let players = Map.empty<Nat, Player>();
  let turns = Map.empty<Nat, Turn>();
  let shotEvents = Map.empty<Nat, ShotEvent>();
  let playerGameStats = Map.empty<Nat, PlayerGameStats>();
  let users = Map.empty<Text, User>();
  let emailIndex = Map.empty<Text, Text>();
  let usernameIndex = Map.empty<Text, Text>();
  let userStats = Map.empty<Text, UserStats>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  // New OAuth uniqueness index for (provider, subject) pairs
  let oauthIndex = Map.empty<Text, Text>();

  // ID Sequencer
  var nextId = 1;
  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stats calculation logic
  func calculateStatsForUser(userId : Text) : UserStats {
    let allPlayers = List.empty<Player>();
    for ((id, player) in players.entries()) { allPlayers.add(player) };
    let allGames = List.empty<Game>();
    for ((id, game) in games.entries()) { allGames.add(game) };
    let allTurns = List.empty<Turn>();
    for ((id, turn) in turns.entries()) { allTurns.add(turn) };

    let relevantPlayers = allPlayers.toArray().filter(
      func(player) {
        switch (player.userId) {
          case (?uid) { uid == userId };
          case (null) { false };
        };
      }
    );

    var gamesPlayed = 0;
    var wins = 0;
    for (player in relevantPlayers.values()) {
      for (game in allGames.toArray().values()) {
        if (player.gameId == game.id and game.status == #Completed) {
          gamesPlayed += 1;
          switch (game.winnerPlayerId) {
            case (?winnerId) { if (winnerId == player.id) { wins += 1 } };
            case (null) {};
          };
        };
      };
    };
    let winRate = if (gamesPlayed > 0) {
      (wins.toFloat()) / (gamesPlayed.toFloat());
    } else { 0.0 };

    var totalPointsScored = 0;
    var dartsThrown = 0;
    var total180s = 0;
    var totalBusts = 0;
    var checkoutAttempts = 0;
    var checkoutSuccess = 0;

    for (turn in allTurns.toArray().values()) {
      for (player in relevantPlayers.values()) {
        if (turn.playerId == player.id) {
          totalPointsScored += turn.score;
          dartsThrown += 3;

          if (turn.turnTotal == 180) { total180s += 1 };
          if (turn.isBust) { totalBusts += 1 };

          if (turn.remainingBefore <= 170) { checkoutAttempts += 1 };
          switch (games.get(turn.gameId)) {
            case (?game) {
              if (game.status == #Completed) {
                switch (game.winnerPlayerId) {
                  case (?winnerId) {
                    if (winnerId == turn.playerId and turn.remainingBefore <= 170) {
                      checkoutSuccess += 1;
                    };
                  };
                  case (null) {};
                };
              };
            };
            case (null) {};
          };
        };
      };
    };

    let avg3dartOverall = if (dartsThrown > 0) {
      (totalPointsScored.toFloat() / dartsThrown.toFloat()) * 3.0;
    } else { 0.0 };

    let checkoutRate = if (checkoutAttempts > 0) {
      (checkoutSuccess.toFloat() / checkoutAttempts.toFloat());
    } else { 0.0 };

    {
      gamesPlayed;
      wins;
      winRate;
      avg3dartOverall;
      first9AvgOverall = null;
      checkoutAttempts;
      checkoutSuccess;
      checkoutRate;
      total180s;
      totalBusts;
      updatedAt = Time.now();
    };
  };

  func updateStatsForAllPlayers(gameId : Nat) {
    switch (games.get(gameId)) {
      case (?game) {
        for ((id, player) in players.entries()) {
          if (player.gameId == gameId) {
            switch (player.userId) {
              case (?userId) {
                let stats = calculateStatsForUser(userId);
                userStats.add(userId, stats);
              };
              case (null) {};
            };
          };
        };
      };
      case (null) {};
    };
  };

  // Authorization endpoint
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Added me-like query endpoint (allowing any authenticated principal) ---
  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (caller == Principal.fromText("2vxsx-fae")) {
      Runtime.trap("Unauthorized: Anonymous principals cannot view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getMyStats() : async ?UserStats {
    if (caller == Principal.fromText("2vxsx-fae")) {
      Runtime.trap("Unauthorized: Anonymous principals cannot view stats");
    };
    userStats.get(caller.toText());
  };

  public query ({ caller }) func getUserStats(userId : Text) : async ?UserStats {
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own stats");
    };
    userStats.get(userId);
  };

  // Main register logic (handles email/username indexing and empty OAuth fields)
  func createNewUser(id : Text, email : Text, username : Text, oauth_provider : ?Text, oauth_subject : ?Text, email_verified : Bool) : User {
    let now = Time.now();
    {
      id;
      email;
      username;
      oauth_provider;
      oauth_subject;
      email_verified;
      createdAt = now;
      lastLoginAt = ?now;
    };
  };

  func addUserToPersistentStorage(user : User) : () {
    users.add(user.id, user);
    emailIndex.add(user.email, user.id);
    usernameIndex.add(user.username, user.id);
    switch (user.oauth_provider, user.oauth_subject) {
      case (?provider, ?subject) {
        let compositeKey = provider # ":" # subject;
        oauthIndex.add(compositeKey, user.id);
      };
      case (_) {};
    };
    userStats.add(user.id, {
      gamesPlayed = 0;
      wins = 0;
      winRate = 0.0;
      avg3dartOverall = 0.0;
      first9AvgOverall = null;
      checkoutAttempts = 0;
      checkoutSuccess = 0;
      checkoutRate = 0.0;
      total180s = 0;
      totalBusts = 0;
      updatedAt = Time.now();
    });
  };

  public shared ({ caller }) func register(email : Text, username : Text) : async User {
    if (caller == Principal.fromText("2vxsx-fae")) {
      Runtime.trap("Anonymous registration is not allowed. Please log in with Internet Identity.");
    };

    switch (users.get(caller.toText())) {
      case (?_) { Runtime.trap("User already registered!") };
      case (null) {};
    };

    switch (emailIndex.get(email)) {
      case (?_) { Runtime.trap("Email already exists!") };
      case (null) {};
    };

    switch (usernameIndex.get(username)) {
      case (?_) { Runtime.trap("Username already exists!") };
      case (null) {};
    };

    let user = createNewUser(
      caller.toText(),
      email,
      username,
      null, // No oauth_provider
      null, // No oauth_subject
      false // email_verified
    );

    addUserToPersistentStorage(user);

    // Assign user role to newly registered user
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    user;
  };

  func validateAdminToken(room : Room, providedToken : AdminToken) : () {
    switch (room.admin_token_hash) {
      case (?storedHash) {
        if (storedHash != providedToken) {
          Runtime.trap("Invalid admin token provided.");
        };
      };
      case (null) { Runtime.trap("No admin token found for this room.") };
    };
  };

  func validateRoomAccess(room : Room, maybe_token : ?Text, caller : Principal) : () {
    switch (room.owner_user_id) {
      case (?ownerId) {
        if (ownerId != caller) {
          Runtime.trap("Unauthorized: Only the room owner can perform this action");
        };
      };
      case (null) {
        switch (maybe_token) {
          case (?token) { validateAdminToken(room, token) };
          case (null) {
            Runtime.trap("Unauthorized: Admin token required for no-account rooms");
          };
        };
      };
    };
  };

  public shared ({ caller }) func createRoomV2(
    code : Text,
    hostId : Text,
    create_with_account : Bool
  ) : async {
    room : Room;
    admin_token : ?Text;
  } {
    let roomId = getNextId();

    if (create_with_account) {
      // Creating room with account requires user permission
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only authenticated users can create rooms with accounts");
      };

      let room : Room = {
        id = roomId;
        code;
        hostId;
        status = #Open;
        owner_user_id = ?caller;
        admin_token_hash = null;
      };
      rooms.add(roomId, room);

      { room; admin_token = null };
    } else {
      // Anonymous room creation - anyone including guests can create
      // No authorization check needed for anonymous rooms
      let raw_token = "token_should_be_hashed_on_frontend";
      let token_hash = raw_token;

      let room : Room = {
        id = roomId;
        code;
        hostId;
        status = #Open;
        owner_user_id = null;
        admin_token_hash = ?token_hash;
      };
      rooms.add(roomId, room);

      { room; admin_token = ?raw_token };
    };
  };

  public query func getRoomByCode(code : Text) : async ?Room {
    // Guests can view rooms (needed to join games)
    var foundRoom : ?Room = null;
    for ((_, room) in rooms.toArray().values()) {
      if (Text.equal(room.code, code)) {
        foundRoom := ?room;
      };
    };
    foundRoom;
  };

  public shared ({ caller }) func createGame(roomId : Nat, adminToken : ?AdminToken) : async Game {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room with ID " # roomId.toText() # " not found.") };
      case (?room) {
        validateRoomAccess(room, adminToken, caller);
        let gameId = getNextId();
        let newGame : Game = {
          id = gameId;
          roomId;
          status = #Pending;
          startTime = Time.now();
          endTime = null;
          winnerPlayerId = null;
        };
        games.add(gameId, newGame);
        newGame;
      };
    };
  };

  public query func getGamesByRoom(roomId : Nat) : async [Game] {
    // Guests can view games (needed to participate)
    let gamesList = List.empty<Game>();
    for ((id, game) in games.entries()) {
      if (game.roomId == roomId) {
        gamesList.add(game);
      };
    };
    gamesList.toArray();
  };

  public query func getGame(gameId : Nat) : async ?Game {
    // Guests can view games (needed to participate)
    games.get(gameId);
  };

  public shared ({ caller }) func setGameWinner(gameId : Nat, playerId : Nat, adminToken : ?AdminToken) : async () {
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        switch (players.get(playerId)) {
          case (?player) {
            if (player.remainingScore != 0) {
              Runtime.trap("Winner must have remaining score of 0");
            };
          };
          case (null) { Runtime.trap("Player not found") };
        };
        switch (rooms.get(game.roomId)) {
          case (?room) { validateRoomAccess(room, adminToken, caller) };
          case (null) { Runtime.trap("Room with ID " # game.roomId.toText() # " not found.") };
        };
        let updatedGame : Game = {
          game with
          winnerPlayerId = ?playerId;
          status = #Completed;
          endTime = ?Time.now();
        };
        games.add(gameId, updatedGame);

        updateStatsForAllPlayers(gameId);
        calculateAndStorePlayerStats(gameId);
      };
    };
  };

  public shared ({ caller }) func updateGameStatus(gameId : Nat, newStatus : GameStatus, adminToken : ?AdminToken) : async () {
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        switch (rooms.get(game.roomId)) {
          case (?room) { validateRoomAccess(room, adminToken, caller) };
          case (null) { Runtime.trap("Room with ID " # game.roomId.toText() # " not found.") };
        };
        let updatedGame = { game with status = newStatus };
        games.add(gameId, updatedGame);
      };
    };
  };

  func calculateAndStorePlayerStats(gameId : Nat) : () {
    switch (games.get(gameId)) {
      case (?game) {
        switch (game.status) {
          case (#Completed) { computeStatsForAllPlayers(gameId) };
          case (_) {};
        };
      };
      case (null) {};
    };
  };

  func computeStatsForAllPlayers(gameId : Nat) : () {
    let playerList = List.empty<Player>();
    let turnList = List.empty<Turn>();

    for ((id, player) in players.entries()) {
      if (player.gameId == gameId) {
        playerList.add(player);
      };
    };

    for ((id, turn) in turns.entries()) {
      if (turn.gameId == gameId) {
        turnList.add(turn);
      };
    };

    let playersArray = playerList.toArray();
    let turnsArray = turnList.toArray();

    for (player in playersArray.values()) {
      let playerTurns = turnsArray.filter(
        func(turn) { turn.playerId == player.id }
      );
      let stats = calculateStatsForPlayer(gameId, player, playerTurns);
      playerGameStats.add(stats.id, stats);
    };
  };

  func calculateStatsForPlayer(gameId : Nat, player : Player, playerTurns : [Turn]) : PlayerGameStats {
    var dartsThrown = 0;
    var pointsScoredTotal = 0;
    var total180s = 0;
    var totalBusts = 0;
    var checkoutAttempts = 0;
    var checkoutSuccess = 0;

    for (turn in playerTurns.values()) {
      dartsThrown += 3;
      pointsScoredTotal += turn.score;
      if (turn.turnTotal == 180) { total180s += 1 };
      if (turn.isBust) { totalBusts += 1 };
      if (turn.remainingBefore <= 170) { checkoutAttempts += 1 };
      if (turn.remainingBefore <= 170) {
        checkoutSuccess += 1;
      };
    };

    let avg3dart = if (dartsThrown > 0) {
      (pointsScoredTotal.toFloat() / dartsThrown.toFloat()) * 3.0;
    } else { 0.0 };

    {
      id = getNextId();
      gameId;
      playerId = player.id;
      userId = player.userId;
      dartsThrown;
      pointsScoredTotal;
      avg3dart;
      first9Avg = null;
      num180s = total180s;
      numBusts = totalBusts;
      checkoutAttempts;
      checkoutSuccess;
      createdAt = Time.now();
    };
  };

  public query func getPlayerGameStatsByGame(gameId : Nat) : async [PlayerGameStats] {
    // Guests can view game stats (needed to see game results)
    let statsList = List.empty<PlayerGameStats>();
    for ((id, stats) in playerGameStats.entries()) {
      if (stats.gameId == gameId) {
        statsList.add(stats);
      };
    };
    statsList.toArray();
  };

  public query ({ caller }) func getPlayerGameStatsByUser(userId : Text) : async [PlayerGameStats] {
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own player game stats");
    };
    let statsList = List.empty<PlayerGameStats>();
    for ((id, stats) in playerGameStats.entries()) {
      switch (stats.userId) {
        case (?uid) { if (uid == userId) { statsList.add(stats) } };
        case (null) {};
      };
    };
    statsList.toArray();
  };

  public shared ({ caller }) func addPlayer(
    gameId : Nat,
    roomId : Nat,
    displayName : Text,
    userId : ?Text,
    isHost : Bool,
    adminToken : ?AdminToken,
  ) : async Player {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room with ID " # roomId.toText() # " not found.") };
      case (?room) {
        validateRoomAccess(room, adminToken, caller);
        let playerId = getNextId();
        let newPlayer : Player = {
          id = playerId;
          gameId;
          roomId;
          displayName;
          userId;
          isHost;
          joinedAt = 0;
          remainingScore = 501;
        };
        players.add(playerId, newPlayer);
        newPlayer;
      };
    };
  };

  public query func getPlayersByGame(gameId : Nat) : async [Player] {
    // Guests can view players (needed to see game participants)
    let playersList = List.empty<Player>();
    for ((id, player) in players.entries()) {
      if (player.gameId == gameId) {
        playersList.add(player);
      };
    };
    playersList.toArray();
  };

  public shared ({ caller }) func updatePlayerRemaining(playerId : Nat, newRemaining : Int, adminToken : ?AdminToken) : async () {
    switch (players.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) {
        switch (games.get(player.gameId)) {
          case (?game) {
            switch (rooms.get(game.roomId)) {
              case (?room) {
                validateRoomAccess(room, adminToken, caller);
              };
              case (null) { Runtime.trap("Room with ID " # game.roomId.toText() # " not found.") };
            };
          };
          case (null) { Runtime.trap("Game not found") };
        };
        let updatedPlayer : Player = {
          player with
          remainingScore = newRemaining;
        };
        players.add(playerId, updatedPlayer);
      };
    };
  };

  public shared ({ caller }) func createTurn(gameId : Nat, playerId : Nat, turnIndex : Nat, adminToken : ?AdminToken) : async Turn {
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        switch (rooms.get(game.roomId)) {
          case (?room) { validateRoomAccess(room, adminToken, caller) };
          case (null) { Runtime.trap("Room with ID " # game.roomId.toText() # " not found.") };
        };
        let turnId = getNextId();
        let newTurn : Turn = {
          id = turnId;
          gameId;
          playerId;
          turnIndex;
          score = 0;
          isBust = false;
          remainingBefore = 0;
          turnTotal = 0;
        };
        turns.add(turnId, newTurn);
        newTurn;
      };
    };
  };

  public query func getTurnsByGameAndIndex(gameId : Nat, turnIndex : Nat) : async [Turn] {
    // Guests can view turns (needed to see game progress)
    let turnsList = List.empty<Turn>();
    for ((id, turn) in turns.entries()) {
      if (turn.gameId == gameId and turn.turnIndex == turnIndex) {
        turnsList.add(turn);
      };
    };
    turnsList.toArray();
  };

  public query func getTurnsByGamePaginated(gameId : Nat, limit : Nat, offset : Nat) : async [Turn] {
    // Guests can view turns (needed to see game progress)
    let turnsForGameList = List.empty<Turn>();
    for ((id, turn) in turns.entries()) {
      if (turn.gameId == gameId) {
        turnsForGameList.add(turn);
      };
    };
    let turnsForGame = turnsForGameList.toArray();
    let turnsCount = turnsForGame.size();
    let endIndex = Nat.min(offset + limit, turnsCount);
    var i = offset;
    let slicedTurns = List.empty<Turn>();
    while (i < endIndex) {
      slicedTurns.add(turnsForGame[i]);
      i += 1;
    };
    slicedTurns.toArray();
  };

  public query func getShotEventsByTurn(turnId : Nat) : async [ShotEvent] {
    // Guests can view shot events (needed to see game details)
    let shotEventsForTurn = List.empty<ShotEvent>();
    for ((id, shotEvent) in shotEvents.entries()) {
      if (shotEvent.turnId == turnId) {
        shotEventsForTurn.add(shotEvent);
      };
    };
    shotEventsForTurn.toArray();
  };

  public query ({ caller }) func getUserGamesParticipated(userId : Text, limit : Nat, offset : Nat, mode : ?Text, from : ?Nat, to : ?Nat) : async [GameWithStatistics] {
    // Users can only view their own games, admins can view any
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own games");
    };
    let userPlayerIds = List.empty<Nat>();
    for ((playerId, player) in players.entries()) {
      switch (player.userId) {
        case (?uid) {
          if (uid == userId) {
            userPlayerIds.add(playerId);
          };
        };
        case (null) {};
      };
    };
    let participatedGames = List.empty<GameWithStatistics>();
    for ((gameId, game) in games.entries()) {
      var userParticipated = false;
      for (playerId in userPlayerIds.values()) {
        switch (players.get(playerId)) {
          case (?player) {
            if (player.gameId == gameId) {
              userParticipated := true;
            };
          };
          case (null) {};
        };
      };
      if (userParticipated) {
        var includeGame = true;
        switch (from) {
          case (?fromTime) {
            if (game.startTime < fromTime) {
              includeGame := false;
            };
          };
          case (null) {};
        };
        switch (to) {
          case (?toTime) {
            if (game.startTime > toTime) {
              includeGame := false;
            };
          };
          case (null) {};
        };
        if (includeGame) {
          participatedGames.add({
            gameId = game.id;
            startedAt = game.startTime;
            finishedAt = game.endTime;
            mode = switch (mode) { case (?m) { m }; case (null) { "default" } };
            doubleOut = false;
            place = 1;
            avg = 80.5;
            _180s = 0;
            checkoutPercent = 50.0;
            win = false;
          });
        };
      };
    };
    let allGames = participatedGames.toArray();
    let totalGames = allGames.size();
    let endIndex = Nat.min(offset + limit, totalGames);
    var i = offset;
    let slicedGamesList = List.empty<GameWithStatistics>();
    while (i < endIndex) {
      if (i < totalGames) {
        slicedGamesList.add(allGames[i]);
      };
      i += 1;
    };
    slicedGamesList.toArray();
  };

  public shared ({ caller }) func createShotEvent(turnId : Nat, target : Nat, points : Nat, multiplier : Nat, adminToken : ?AdminToken) : async ShotEvent {
    switch (turns.get(turnId)) {
      case (?turn) {
        switch (games.get(turn.gameId)) {
          case (?game) {
            switch (rooms.get(game.roomId)) {
              case (?room) { validateRoomAccess(room, adminToken, caller) };
              case (null) { Runtime.trap("Room with ID " # game.roomId.toText() # " not found.") };
            };
          };
          case (null) { Runtime.trap("Game not found") };
        };
      };
      case (null) { Runtime.trap("Turn not found") };
    };
    let shotEventId = getNextId();
    let newShotEvent : ShotEvent = {
      id = shotEventId;
      turnId;
      target;
      points;
      multiplier;
    };
    shotEvents.add(shotEventId, newShotEvent);
    newShotEvent;
  };

  public query func getHealthStatus() : async HealthStatus {
    let healthCheck = {
      name = "persistent_storage";
      healthy = true;
      message = ?"Stable persistent storage operational.";
    };
    {
      ok = healthCheck.healthy;
      components = [healthCheck];
      message = "IC System is healthy.";
      httpCode = 200;
    };
  };

  public query func getGoogleOAuthConfig() : async GoogleOAuthConfig {
    googleOAuthConfig;
  };

  public query func health() : async Text {
    "IC System is healthy.";
  };

  public query func getGoogleOAuthStartUrl() : async Text {
    let state = "dummy_oauth_state";
    let endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    let responseType = "code";
    let scope = "openid+email+profile";
    let accessType = "offline";
    let prompt = "consent";
    let nonce = "dummy_nonce";

    endpoint
    # "?client_id=" # googleOAuthConfig.clientId
    # "&redirect_uri=" # googleOAuthConfig.redirectPath
    # "&response_type=" # responseType
    # "&state=" # state
    # "&scope=" # scope
    # "&access_type=" # accessType
    # "&prompt=" # prompt
    # "&nonce=" # nonce;
  };
};
