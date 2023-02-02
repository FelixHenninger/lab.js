{
  # Use with `nix develop`
  description = "Your next node.js project";

  # Use the unstable nixpkgs to use the latest set of node packages
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem
    (system: let
      pkgs = import nixpkgs {
        inherit system;
      };
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          # Set the major version of Node.js
          pkgs.nodejs-18_x
          pkgs.nodePackages.yarn
          pkgs.python310
          # node-gyp dependencies
          pkgs.pkg-config
          pkgs.pixman
          pkgs.libffi
          # Website builder
          pkgs.deno
          pkgs.zola
        ];
      };
    });
}
