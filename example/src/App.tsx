import { useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthCheckServiceClient } from "./protobuf-ts-gen/example.client";
import { HealthCheckRequest, HealthCheckReply } from "./protobuf-ts-gen/example";

const BACKEND_URL = `http://${import.meta.env.VITE_GRPC_SERVER_ADDRESS}:${import.meta.env.VITE_GRPC_SERVER_PORT}`;

const transport = new GrpcWebFetchTransport({
  baseUrl: BACKEND_URL,
});
const echoClient = new HealthCheckServiceClient(transport);

export default function HealthCheck() {
  const [outputValue, setOutValue] = useState("Click 'Check Health!' to trigger a health check");

  const handleSubmit = async () => {
    console.log(`Sending Request to ${BACKEND_URL}`);
    echoClient
      .checkHealth(HealthCheckRequest.create({}))
      .then((res) => setOutValue(`Success! ${res}`))
      .catch((e) => setOutValue(`Error! ${e}`));
  };

  return (
    <>
      <div className="max-w-2xl p-8 text-center">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <button className="border p-1 rounded shadow" onClick={handleSubmit}>Check Health!</button>
        <p>{outputValue}</p>
      </div>
    </>
  );

}