{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.protobuf
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';

  nativeBuildInputs = [
    (pkgs.buildNpmPackage {
      name = "protoc-gen-ts-deps";
      packageJSON = ./package.json;
      lockFile = ./package-lock.json;
      src = ./.;
      npmDepsHash = "sha256-8XA5valnl19UGeRL+ikVwuCFFAi6fSozVFeWoZzAzrQ=";
    })
  ];
}
