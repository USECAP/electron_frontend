
void double_free(void* p) {
  free(p);
  free(p);
}
