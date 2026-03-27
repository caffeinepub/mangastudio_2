import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      return Text.compare(p1.id, p2.id);
    };
  };

  type EffectType = {
    #speed_lines;
    #impact;
    #zoom;
    #flash;
    #none;
  };

  type OverlayStyle = {
    #normal;
    #shout;
    #sfx;
    #bubble;
  };

  type TextOverlay = {
    text : Text;
    x : Int;
    y : Int;
    style : OverlayStyle;
  };

  type Frame = {
    id : Text;
    blobId : Storage.ExternalBlob;
    effectType : EffectType;
    duration : Nat;
    textOverlays : [TextOverlay];
    order : Nat;
  };

  type Project = {
    id : Text;
    ownerId : Principal;
    title : Text;
    description : Text;
    frames : [Frame];
    createdAt : Int;
    updatedAt : Int;
  };

  module ProjectDTO {
    public func toProject(p : ProjectDTO, ownerId : Principal) : Project {
      let now = Time.now();
      {
        id = p.id;
        ownerId;
        title = p.title;
        description = p.description;
        frames = p.frames;
        createdAt = now;
        updatedAt = now;
      };
    };
  };

  type ProjectDTO = {
    id : Text;
    title : Text;
    description : Text;
    frames : [Frame];
  };

  type ProjectMeta = {
    id : Text;
    title : Text;
    description : Text;
    frameCount : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  module ProjectMeta {
    public func compare(p1 : ProjectMeta, p2 : ProjectMeta) : Order.Order {
      return Text.compare(p1.id, p2.id);
    };
  };

  let projects = Map.empty<Text, Project>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  private func getProjectInternal(projectId : Text) : Project {
    switch (projects.get(projectId)) {
      case (null) {
        Runtime.trap("Project with id " # projectId # " not found");
      };
      case (?project) { project };
    };
  };

  public shared ({ caller }) func createProject(dto : ProjectDTO) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    if (projects.containsKey(dto.id)) {
      Runtime.trap("Project with id " # dto.id # " already exists");
    };


    let project = ProjectDTO.toProject(dto, caller);
    projects.add(dto.id, project);
  };

  public shared ({ caller }) func updateProject(projectId : Text, dto : ProjectDTO) : async () {
    let existing = getProjectInternal(projectId);
    if (existing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own project.");
    };

    let updated : Project = {
      id = projectId;
      ownerId = existing.ownerId;
      title = dto.title;
      description = dto.description;
      frames = dto.frames;
      createdAt = existing.createdAt;
      updatedAt = Time.now();
    };
    projects.add(projectId, updated);
  };

  public query ({ caller }) func getProject(projectId : Text) : async Project {
    let project = getProjectInternal(projectId);
    if (project.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own project.");
    };
    project;
  };

  public query ({ caller }) func listUserProjects() : async [ProjectMeta] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their projects");
    };
    projects.values().toArray().filter(
      func(p) {
        p.ownerId == caller;
      }
    ).map(
      func(p) {
        {
          id = p.id;
          title = p.title;
          description = p.description;
          frameCount = p.frames.size();
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      }
    ).sort();
  };

  public shared ({ caller }) func deleteProject(projectId : Text) : async () {
    let project = getProjectInternal(projectId);
    if (project.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own project.");
    };
    projects.remove(projectId);
  };
};
