all: clean fuzzme

fuzzme:
	$(CC) -c fuzzme.c -o $@.o

clean:
	rm -f *.o *.so
	rm -rf scan-build-*
	rm -f fuzzing/*.o
	find ci-fuzzing-targets -executable -type f -exec rm {} \;
	rm -rf ci-fuzzing-targets/crash-*
