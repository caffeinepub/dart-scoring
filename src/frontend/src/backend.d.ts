import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: bigint;
    userId: bigint;
    joinedAt: bigint;
    isHost: boolean;
    roomId: bigint;
}
export interface Game {
    id: bigint;
    startTime: bigint;
    status: GameStatus;
    endTime?: bigint;
    roomId: bigint;
}
export interface ShotEvent {
    id: bigint;
    multiplier: bigint;
    turnId: bigint;
    target: bigint;
    points: bigint;
}
export interface Turn {
    id: bigint;
    playerId: bigint;
    gameId: bigint;
    score: bigint;
    turnIndex: bigint;
}
export interface Room {
    id: bigint;
    status: RoomStatus;
    code: string;
    adminToken: string;
    hostId: bigint;
}
export type AdminToken = string;
export enum GameStatus {
    Active = "Active",
    Completed = "Completed",
    Pending = "Pending"
}
export enum RoomStatus {
    Open = "Open",
    Closed = "Closed",
    InProgress = "InProgress"
}
export interface backendInterface {
    addPlayer(userId: bigint, roomId: bigint, isHost: boolean): Promise<Player>;
    createGame(roomId: bigint): Promise<Game>;
    createRoom(code: string, hostId: bigint, adminToken: string): Promise<Room>;
    createShotEvent(turnId: bigint, target: bigint, points: bigint, multiplier: bigint, roomCode: string, adminToken: AdminToken): Promise<ShotEvent>;
    createTurn(gameId: bigint, playerId: bigint, turnIndex: bigint, roomCode: string, adminToken: AdminToken): Promise<Turn>;
    getGamesByRoom(roomId: bigint): Promise<Array<Game>>;
    getRoomByCode(code: string): Promise<Room | null>;
    getShotEventsByTurn(turnId: bigint): Promise<Array<ShotEvent>>;
    getTurnsByGameAndIndex(gameId: bigint, turnIndex: bigint): Promise<Array<Turn>>;
    health(): Promise<string>;
    updateGameStatus(gameId: bigint, newStatus: GameStatus, roomCode: string, adminToken: AdminToken): Promise<void>;
}
