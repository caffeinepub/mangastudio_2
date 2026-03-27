import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Frame {
    id: string;
    duration: bigint;
    order: bigint;
    textOverlays: Array<TextOverlay>;
    blobId: ExternalBlob;
    effectType: EffectType;
}
export interface ProjectDTO {
    id: string;
    title: string;
    description: string;
    frames: Array<Frame>;
}
export interface TextOverlay {
    x: bigint;
    y: bigint;
    text: string;
    style: OverlayStyle;
}
export interface ProjectMeta {
    id: string;
    title: string;
    frameCount: bigint;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
}
export interface Project {
    id: string;
    title: string;
    ownerId: Principal;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
    frames: Array<Frame>;
}
export enum EffectType {
    flash = "flash",
    impact = "impact",
    none = "none",
    zoom = "zoom",
    speed_lines = "speed_lines"
}
export enum OverlayStyle {
    sfx = "sfx",
    normal = "normal",
    shout = "shout",
    bubble = "bubble"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(dto: ProjectDTO): Promise<void>;
    deleteProject(projectId: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(projectId: string): Promise<Project>;
    isCallerAdmin(): Promise<boolean>;
    listUserProjects(): Promise<Array<ProjectMeta>>;
    updateProject(projectId: string, dto: ProjectDTO): Promise<void>;
}
