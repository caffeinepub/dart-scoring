import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Type Definitions
  type Room = {
    id : Nat;
    code : Text;
    hostId : Nat;
    status : RoomStatus;
    adminToken : Text;
  };

  module RoomStatus {
    public type RoomStatus = {
      #Open;
      #InProgress;
      #Closed;
    };
  };
  type RoomStatus = RoomStatus.RoomStatus;

  module GameStatus {
    public type GameStatus = {
      #Pending;
      #Active;
      #Completed;
    };
  };
  type GameStatus = GameStatus.GameStatus;

  type Game = {
    id : Nat;
    roomId : Nat;
    status : GameStatus;
    startTime : Int;
    endTime : ?Int;
  };

  type Player = {
    id : Nat;
    userId : Nat;
    roomId : Nat;
    isHost : Bool;
    joinedAt : Nat;
  };

  type Turn = {
    id : Nat;
    gameId : Nat;
    playerId : Nat;
    turnIndex : Nat;
    score : Nat;
  };

  type ShotEvent = {
    id : Nat;
    turnId : Nat;
    target : Nat;
    points : Nat;
    multiplier : Nat;
  };

  type AdminToken = Text;

  let rooms = Map.empty<Nat, Room>();
  let games = Map.empty<Nat, Game>();
  let players = Map.empty<Nat, Player>();
  let turns = Map.empty<Nat, Turn>();
  let shotEvents = Map.empty<Nat, ShotEvent>();

  var nextId = 1;
  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  // Health Checks
  module HealthStatus {
    public type HealthStatus = { #Ok : Bool; #Error : Text };

    public func mapHealthStatusToText(status : HealthStatus) : Text {
      switch (status) {
        case (#Ok(_)) { "Operational" };
        case (#Error(msg)) { "Unhealthy: " # msg };
      };
    };
  };

  public query ({ caller }) func health() : async Text {
    let status : HealthStatus.HealthStatus = #Ok(true);
    HealthStatus.mapHealthStatusToText(status);
  };

  // Room Management
  public shared ({ caller }) func createRoom(code : Text, hostId : Nat, adminToken : Text) : async Room {
    let roomId = getNextId();
    let newRoom : Room = {
      id = roomId;
      code;
      hostId;
      status = #Open;
      adminToken;
    };
    rooms.add(roomId, newRoom);
    newRoom;
  };

  public query ({ caller }) func getRoomByCode(code : Text) : async ?Room {
    let roomsArray = rooms.toArray();
    for ((id, room) in roomsArray.values()) {
      if (room.code == code) {
        return ?room;
      };
    };
    null;
  };

  // Validate AdminToken
  func validateAdminToken(roomCode : Text, providedToken : AdminToken) : () {
    let roomEntry : ?(Nat, Room) = rooms.toArray().find(func((_, r)) { r.code == roomCode });
    switch (roomEntry) {
      case (?(roomId, room)) {
        if (room.adminToken != providedToken) {
          Runtime.trap("Invalid admin token provided.");
        };
      };
      case (null) {
        Runtime.trap("Room with code " # roomCode # " not found.");
      };
    };
  };

  // Game Management
  public shared ({ caller }) func createGame(roomId : Nat) : async Game {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room with ID " # roomId.toText() # " not found. ") };
      case (?_) {
        let gameId = getNextId();
        let newGame : Game = {
          id = gameId;
          roomId;
          status = #Pending;
          startTime = 0;
          endTime = null;
        };
        games.add(gameId, newGame);
        newGame;
      };
    };
  };

  public shared ({ caller }) func updateGameStatus(gameId : Nat, newStatus : GameStatus, roomCode : Text, adminToken : AdminToken) : async () {
    validateAdminToken(roomCode, adminToken);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game with ID " # gameId.toText() # " not found. ") };
      case (?game) {
        let updatedGame = { game with status = newStatus };
        games.add(gameId, updatedGame);
      };
    };
  };

  public query ({ caller }) func getGamesByRoom(roomId : Nat) : async [Game] {
    let gamesList = List.empty<Game>();
    for ((id, game) in games.entries()) {
      if (game.roomId == roomId) {
        gamesList.add(game);
      };
    };
    gamesList.toArray();
  };

  // Player Management
  public shared ({ caller }) func addPlayer(userId : Nat, roomId : Nat, isHost : Bool) : async Player {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room with ID " # roomId.toText() # " not found. ") };
      case (?_) {
        let playerId = getNextId();
        let newPlayer : Player = {
          id = playerId;
          userId;
          roomId;
          isHost;
          joinedAt = 0;
        };
        players.add(playerId, newPlayer);
        newPlayer;
      };
    };
  };

  // Turn Management
  public shared ({ caller }) func createTurn(gameId : Nat, playerId : Nat, turnIndex : Nat, roomCode : Text, adminToken : AdminToken) : async Turn {
    validateAdminToken(roomCode, adminToken);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game with ID " # gameId.toText() # " not found. ") };
      case (?_) {
        let turnId = getNextId();
        let newTurn : Turn = {
          id = turnId;
          gameId;
          playerId;
          turnIndex;
          score = 0;
        };
        turns.add(turnId, newTurn);
        newTurn;
      };
    };
  };

  public query ({ caller }) func getTurnsByGameAndIndex(gameId : Nat, turnIndex : Nat) : async [Turn] {
    let turnsList = List.empty<Turn>();
    for ((id, turn) in turns.entries()) {
      if (turn.gameId == gameId and turn.turnIndex == turnIndex) {
        turnsList.add(turn);
      };
    };
    turnsList.toArray();
  };

  // Shot Event Management
  public shared ({ caller }) func createShotEvent(turnId : Nat, target : Nat, points : Nat, multiplier : Nat, roomCode : Text, adminToken : AdminToken) : async ShotEvent {
    validateAdminToken(roomCode, adminToken);
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

  public query ({ caller }) func getShotEventsByTurn(turnId : Nat) : async [ShotEvent] {
    let shotEventsForTurn = List.empty<ShotEvent>();
    for ((id, shotEvent) in shotEvents.entries()) {
      if (shotEvent.turnId == turnId) {
        shotEventsForTurn.add(shotEvent);
      };
    };
    shotEventsForTurn.toArray();
  };
};
