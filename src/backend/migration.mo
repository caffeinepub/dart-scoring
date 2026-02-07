import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type RoomStatus = { #Open; #InProgress; #Closed };
  type GameStatus = { #Pending; #Active; #Completed };

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

  type OldActor = {
    rooms : Map.Map<Nat, Room>;
    games : Map.Map<Nat, Game>;
    players : Map.Map<Nat, Player>;
    turns : Map.Map<Nat, Turn>;
    shotEvents : Map.Map<Nat, ShotEvent>;
    nextId : Nat;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
