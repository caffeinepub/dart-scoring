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
    remainingScore: bigint;
    displayName: string;
    userId?: string;
    joinedAt: bigint;
    gameId: bigint;
    isHost: boolean;
    roomId: bigint;
}
export interface GameWithStatistics {
    avg: number;
    win: boolean;
    startedAt: bigint;
    mode: string;
    gameId: bigint;
    checkoutPercent: number;
    place: bigint;
    _180s: bigint;
    doubleOut: boolean;
    finishedAt?: bigint;
}
export interface Game {
    id: bigint;
    startTime: bigint;
    status: GameStatus;
    endTime?: bigint;
    winnerPlayerId?: bigint;
    roomId: bigint;
}
export type Time = bigint;
export type AdminToken = string;
export interface User {
    id: string;
    username: string;
    lastLoginAt?: Time;
    oauth_subject?: string;
    createdAt: Time;
    email: string;
    email_verified: boolean;
    oauth_provider?: string;
}
export interface Room {
    id: bigint;
    status: RoomStatus;
    admin_token_hash?: string;
    code: string;
    owner_user_id?: Principal;
    hostId: string;
}
export interface HealthStatus {
    ok: boolean;
    httpCode: number;
    components: Array<HealthCheck>;
    message: string;
}
export interface WhoAmI {
    principal: Principal;
    user?: User;
    authenticated: boolean;
}
export interface HealthCheck {
    name: string;
    healthy: boolean;
    message?: string;
}
export interface GoogleOAuthConfig {
    clientId: string;
    frontendOAuthRedirectPath: string;
    redirectPath: string;
}
export type RoomCreateResult = {
    __kind__: "error";
    error: RoomCreationError;
} | {
    __kind__: "success";
    success: {
        admin_token?: string;
        room: Room;
    };
};
export interface PlayerGameStats {
    id: bigint;
    userId?: string;
    playerId: bigint;
    createdAt: bigint;
    gameId: bigint;
    checkoutAttempts: bigint;
    numBusts: bigint;
    dartsThrown: bigint;
    num180s: bigint;
    avg3dart: number;
    pointsScoredTotal: bigint;
    checkoutSuccess: bigint;
    first9Avg?: number;
}
export interface ShotEvent {
    id: bigint;
    multiplier: bigint;
    turnId: bigint;
    target: bigint;
    points: bigint;
}
export interface RoomCreationError {
    code: string;
    message: string;
}
export interface Turn {
    id: bigint;
    playerId: bigint;
    gameId: bigint;
    isBust: boolean;
    score: bigint;
    turnIndex: bigint;
    turnTotal: bigint;
    remainingBefore: bigint;
}
export interface UserStats {
    gamesPlayed: bigint;
    wins: bigint;
    total180s: bigint;
    checkoutAttempts: bigint;
    updatedAt: bigint;
    first9AvgOverall?: number;
    checkoutSuccess: bigint;
    totalBusts: bigint;
    winRate: number;
    avg3dartOverall: number;
    checkoutRate: number;
}
export interface UserProfile {
    username: string;
    name: string;
    email: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlayer(gameId: bigint, roomId: bigint, displayName: string, userId: string | null, isHost: boolean, adminToken: AdminToken | null): Promise<Player>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGame(roomId: bigint, adminToken: AdminToken | null): Promise<Game>;
    createRoomV2(code: string, hostId: string, create_with_account: boolean): Promise<RoomCreateResult>;
    createShotEvent(turnId: bigint, target: bigint, points: bigint, multiplier: bigint, adminToken: AdminToken | null): Promise<ShotEvent>;
    createTurn(gameId: bigint, playerId: bigint, turnIndex: bigint, adminToken: AdminToken | null): Promise<Turn>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGame(gameId: bigint): Promise<Game | null>;
    getGamesByRoom(roomId: bigint): Promise<Array<Game>>;
    getGoogleOAuthConfig(): Promise<GoogleOAuthConfig>;
    getGoogleOAuthStartUrl(): Promise<string>;
    getHealthStatus(): Promise<HealthStatus>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyStats(): Promise<UserStats | null>;
    getPlayerGameStatsByGame(gameId: bigint): Promise<Array<PlayerGameStats>>;
    getPlayerGameStatsByUser(userId: string): Promise<Array<PlayerGameStats>>;
    getPlayersByGame(gameId: bigint): Promise<Array<Player>>;
    getRoomByCode(code: string): Promise<Room | null>;
    getShotEventsByTurn(turnId: bigint): Promise<Array<ShotEvent>>;
    getTurnsByGameAndIndex(gameId: bigint, turnIndex: bigint): Promise<Array<Turn>>;
    getTurnsByGamePaginated(gameId: bigint, limit: bigint, offset: bigint): Promise<Array<Turn>>;
    getUserGamesParticipated(userId: string, limit: bigint, offset: bigint, mode: string | null, from: bigint | null, to: bigint | null): Promise<Array<GameWithStatistics>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(userId: string): Promise<UserStats | null>;
    health(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    register(email: string, username: string): Promise<User>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setGameWinner(gameId: bigint, playerId: bigint, adminToken: AdminToken | null): Promise<void>;
    updateGameStatus(gameId: bigint, newStatus: GameStatus, adminToken: AdminToken | null): Promise<void>;
    updatePlayerRemaining(playerId: bigint, newRemaining: bigint, adminToken: AdminToken | null): Promise<void>;
    whoami(): Promise<WhoAmI>;
}
