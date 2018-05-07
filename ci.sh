#!/usr/bin/bash
# Run continuous integration tests

# Fail at first error
set -e

# Run frontend tests
yarn ci &
frontend_tests=$!

# Run backend tests
pushd nodejs-backend-server
(yarn && yarn ci) &
backend_tests=$!
popd

wait $frontend_tests
wait $backend_tests
