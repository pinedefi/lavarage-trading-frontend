export function portal(node: HTMLElement) {
  const target = document.body;
  target.appendChild(node);

  return {
    destroy() {
      node.remove();
    }
  };
}
