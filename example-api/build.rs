fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("../example-spec/example.proto")?;
    Ok(())
}
