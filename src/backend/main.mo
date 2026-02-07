import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";

import Migration "migration";

(with migration = Migration.run)
actor {
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

  type Room = {
    id : Nat;
    code : Text;
    hostId : Nat;
    status : RoomStatus;
  };

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

  public shared ({ caller }) func createRoom(code : Text, hostId : Nat) : async Room {
    let roomId = getNextId();
    let newRoom : Room = {
      id = roomId;
      code;
      hostId;
      status = #Open;
    };
    rooms.add(roomId, newRoom);
    newRoom;
  };

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

  public shared ({ caller }) func updateGameStatus(gameId : Nat, newStatus : GameStatus) : async () {
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game with ID " # gameId.toText() # " not found. ") };
      case (?game) {
        let updatedGame = { game with status = newStatus };
        games.add(gameId, updatedGame);
      };
    };
  };

  public shared ({ caller }) func createTurn(gameId : Nat, playerId : Nat, turnIndex : Nat) : async Turn {
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

  public query ({ caller }) func getRoomByCode(code : Text) : async ?Room {
    let roomEntry = rooms.toArray().find(func((_, room)) { room.code == code });
    switch (roomEntry) {
      case (null) { null };
      case (?room) { ?room.1 };
    };
  };

  public query ({ caller }) func getGamesByRoom(roomId : Nat) : async [Game] {
    let gamesForRoom = List.empty<Game>();
    for ((_, game) in games.entries()) {
      if (game.roomId == roomId) {
        gamesForRoom.add(game);
      };
    };
    gamesForRoom.toArray();
  };

  public query ({ caller }) func getTurnsByGameAndIndex(gameId : Nat, turnIndex : Nat) : async [Turn] {
    let turnsForGameIndex = List.empty<Turn>();
    for ((_, turn) in turns.entries()) {
      if (turn.gameId == gameId and turn.turnIndex == turnIndex) {
        turnsForGameIndex.add(turn);
      };
    };
    turnsForGameIndex.toArray();
  };
};
