import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Room {
    id: bigint;
    status: RoomStatus;
    code: string;
    hostId: bigint;
}
export interface Turn {
    id: bigint;
    playerId: bigint;
    gameId: bigint;
    score: bigint;
    turnIndex: bigint;
}
export interface Game {
    id: bigint;
    startTime: bigint;
    status: GameStatus;
    endTime?: bigint;
    roomId: bigint;
}
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
    createGame(roomId: bigint): Promise<Game>;
    createRoom(code: string, hostId: bigint): Promise<Room>;
    createTurn(gameId: bigint, playerId: bigint, turnIndex: bigint): Promise<Turn>;
    getGamesByRoom(roomId: bigint): Promise<Array<Game>>;
    getRoomByCode(code: string): Promise<Room | null>;
    getTurnsByGameAndIndex(gameId: bigint, turnIndex: bigint): Promise<Array<Turn>>;
    health(): Promise<string>;
    updateGameStatus(gameId: bigint, newStatus: GameStatus): Promise<void>;
}
