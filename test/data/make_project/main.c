#include <stdlib.h>
#include "main.h"

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
  int *p = malloc(1 * sizeof(int));
  double_free(p);
}
