#include <stdlib.h>

int main(void) {
  int* x;
  return x[0];
}

int test() {
  int x;
  if (x) return 1;
  return 0;
}

void test_unix() {
  int *p = malloc(1);
  free(p);
  free(p); // warn: attempt to free released memory
}

