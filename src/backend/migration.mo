import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";

module {
  type OldRoom = {
    id : Nat;
    code : Text;
    hostId : Nat;
    status : RoomStatus;
  };

  type RoomStatus = {
    #Open;
    #InProgress;
    #Closed;
  };

  type GameStatus = {
    #Pending;
    #Active;
    #Completed;
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

  type OldActor = {
    rooms : Map.Map<Nat, OldRoom>;
    games : Map.Map<Nat, Game>;
    players : Map.Map<Nat, Player>;
    turns : Map.Map<Nat, Turn>;
    shotEvents : Map.Map<Nat, ShotEvent>;
    nextId : Nat;
  };

  type NewRoom = {
    id : Nat;
    code : Text;
    hostId : Nat;
    status : RoomStatus;
    adminToken : Text;
  };

  type NewActor = {
    rooms : Map.Map<Nat, NewRoom>;
    games : Map.Map<Nat, Game>;
    players : Map.Map<Nat, Player>;
    turns : Map.Map<Nat, Turn>;
    shotEvents : Map.Map<Nat, ShotEvent>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newRooms = old.rooms.map<Nat, OldRoom, NewRoom>(
      func(_id, oldRoom) {
        { oldRoom with adminToken = "" };
      }
    );
    {
      old with
      rooms = newRooms;
    };
  };
};
