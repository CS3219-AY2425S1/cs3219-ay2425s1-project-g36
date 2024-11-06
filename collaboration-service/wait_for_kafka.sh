#!/bin/bash
while ! nc -z kafka 9092; do
  echo "Waiting for Kafka..."
  sleep 2
done
echo "Kafka is up - Starting service"
exec "$@"
