cmake_minimum_required(VERSION 3.5)
project(cmake_project)

set(CMAKE_C_STANDARD 11)

set(SOURCE_FILES main.c)
add_executable(cmake_project ${SOURCE_FILES})
