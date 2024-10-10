const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
document.body.appendChild(tooltip);

const bodyEl = document.querySelector("body");

// Lắng nghe sự kiện mouseover trên toàn bộ document
bodyEl.addEventListener("mouseover", (event) => {
  const target = event.target;

  // Tìm phần tử cha có id (nếu có)
  let parentWithId = target.closest("[id]");

  // Lấy vị trí và kích thước của phần tử được hover
  const rect = target.getBoundingClientRect();

  // Hiển thị tooltip bao quanh phần tử
  tooltip.style.width = `${rect.width}px`;
  tooltip.style.height = `${rect.height}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY}px`;
  tooltip.style.display = "block";

  // Lấy id của phần tử cha
  const parentId = parentWithId ? `#${parentWithId.id}` : "";

  // Kiểm tra nếu phần tử đang hover có phải là phần tử cha
  const isHoveringParent = target === parentWithId;

  // Nếu là phần tử cha, chỉ hiển thị id của nó, nếu là con thì hiển thị "cha > con"
  const hoverText = isHoveringParent
    ? `${parentId}`
    : `${parentId} > ${target.tagName.toLowerCase()}`;

  // Hiển thị thông tin trong tooltip
  tooltip.innerHTML = `<span class="tag">${hoverText}</span>`;
});

// Ẩn tooltip khi chuột ra ngoài
bodyEl.addEventListener("mouseout", (event) => {
  tooltip.style.display = "none";
});
