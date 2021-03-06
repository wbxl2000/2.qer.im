function freshList() {
  const selectList = [];
  const categoryElements = document.getElementsByClassName("category");
  for (let i = 0; i < categoryElements.length; i++) {
    const isSelected = categoryElements[i].classList.contains("category-select");
    if (isSelected) { selectList.push(categoryElements[i].innerHTML); }
  }

  let itemsHTML = "";
  salesItemData.forEach(itemData => {
    const { title, id, price, description, pictures, quality, tags, time } = itemData;
    if (tags.includes("sold out")) return;
    const isExisted = tags.some(tag => {
      return (selectList.includes(tag) || selectList.includes("全部"));
    });
    if (!isExisted) return;
    let picturesHTML = "";
    pictures.forEach((pictureData, index) => {
      picturesHTML += `
        <li><img class="img-preview ${!index ? "img-show" : "img-hide"}" data-original="${pictureData}" src="${pictureData}"
            alt="">
        </li>`;
    });
    let tagsHTML = `<span class="tag quality">${quality}</span>`;
    tags.forEach(tag => {
      tagsHTML += `<span class="tag">${tag}</span>`;
    });
    const item = `
      <div class="item" id=${id}>
        <div class="item-body">
          <div class="body-info">
            <div class="info-header">
              <span class="left">
                <span class="title"> ${title}</span>
                <span class="id"> #${id} </span>
              </span>
              <span class="price"> ￥${price}</span>
            </div>
            <div class="description">
              ${description}
            </div>
          </div>
          <div class="body-image" id="galley">
            <ul class="pictures">
              ${picturesHTML}
            </ul>
          </div>
        </div>
        <div class="item-bottom">
          <div class="tags">
            ${tagsHTML}
          </div>
          <div class="modify-time"> ${time.modify}</div>
        </div>
      </div>`;
    itemsHTML += item;
  });

  document.getElementById("item-content").innerHTML = itemsHTML;
  imageView();
}

// image-view
function imageView() {
  const imageContainer = document.getElementsByClassName('img-show');
  let viewer = null;
  let viewerList = [];
  for (let i = 0; i < imageContainer.length; i++) {
    const galley = imageContainer[i].parentNode.parentNode.parentNode;
    imageContainer[i].addEventListener('click', function (e, x) {
      if (!viewerList[i]) {
        viewerList[i] = new Viewer(galley, {
          url: 'data-original',
          toolbar: {
            prev: function () {
              viewer.prev(true);
            },
            next: function () {
              viewer.next(true);
            },
          },
          title: function (image) {
            return image.alt + ' (' + (this.index + 1) + '/' + this.length + ')';
          },
        });
      }
      viewer = viewerList[i];
    });
  }
}

// categories
const categories = new Set();
salesItemData.forEach(itemData => {
  itemData.tags.forEach(tagData => {
    categories.add(tagData);
  })
});

let categoryHTML = `<span class="category category-select">全部</span>`;
for (let category of categories) {
  categoryHTML += `<span class="category">${category}</span>`;
}
document.getElementById("categories").innerHTML += categoryHTML;
const categoryElements = document.getElementsByClassName("category");
for (let i = 0; i < categoryElements.length; i++) {
  categoryElements[i].onclick = () => {
    const isSelected = categoryElements[i].classList.contains("category-select");
    if (isSelected) {
      categoryElements[i].classList.remove("category-select");
    } else {
      categoryElements[i].classList.add("category-select");
      if (!i) {
        for (let j = 1; j < categoryElements.length; j++) {
          categoryElements[j].classList.remove("category-select");
        }
      } else {
        categoryElements[0].classList.remove("category-select");
      }
    }
    freshList();
  }
}

// 多选和导出
const cache = JSON.parse(localStorage.getItem("selectItem")) || [];
let selectItem = new Set(cache);
function freshSelectItem() {
  console.log(selectItem);
  const itemElements = document.getElementsByClassName("item");
  let itemElementsIds = [];
  for (let i = 0; i < itemElements.length; i++) {
    itemElementsIds.push(itemElements[i].id);
    if (selectItem.has(itemElements[i].id)) itemElements[i].classList.add("item-select");
    else itemElements[i].classList.remove("item-select");
  }
  selectItem.forEach(item => {
    if (!itemElementsIds.find(x => x == item)) {
      selectItem.delete(item);
    }
  });
  localStorage.setItem("selectItem", JSON.stringify(Array.from(selectItem)));
}
// ["1","3","4"]
let isSelecting = false;
document.getElementById("select").addEventListener("click", () => {
  document.getElementById("toast").innerHTML = "【选择模式】";
  document.getElementById("select").style.display = "none";
  document.getElementById("cancel").style.display = "inline";
  document.getElementById("export").style.display = "inline";
  document.getElementById("import").style.display = "inline";
  freshSelectItem();
  const itemElements = document.getElementsByClassName("item");
  for (let i = 0; i < itemElements.length; i++) {
    itemElements[i].onclick = () => {
      if (!selectItem.has(itemElements[i].id)) selectItem.add(itemElements[i].id);
      else selectItem.delete(itemElements[i].id);
      freshSelectItem();
    }
  }
});

document.getElementById("cancel").addEventListener("click", () => {
  document.getElementById("toast").innerHTML = "";
  document.getElementById("select").style.display = "inline";
  document.getElementById("cancel").style.display = "none";
  document.getElementById("export").style.display = "none";
  document.getElementById("import").style.display = "none";
  // 去掉选中的样式
  const itemElements = document.getElementsByClassName("item");
  for (let i = 0; i < itemElements.length; i++) {
    itemElements[i].classList.remove("item-select");
  }
});

document.getElementById("import").addEventListener("click", () => {
  document.getElementById("gray").style.display = "block";
  document.getElementById("popup").style.display = "block";
});

document.getElementById("export").addEventListener("click", () => {
  console.log(Array.from(selectItem));
  navigator.clipboard.writeText(JSON.stringify(Array.from(selectItem))).then(() => {
    document.getElementById("cancel").click();
    document.getElementById("toast").innerHTML = "已复制到剪切板，发送给 qer 吧~";
  });
});

// 链接：https://juejin.cn/post/6974018969690734628 横向滚动
const categoriesDiv = document.getElementById("categories");
categoriesDiv.addEventListener('wheel', (event) => {
  event.preventDefault()
  categoriesDiv.scrollLeft += event.deltaY;
})

freshList();

// popup
document.getElementById("popup-close").addEventListener('click', () => {
  document.getElementById("gray").style.display = "none";
  document.getElementById("popup").style.display = "none";
})

document.getElementById("popup-import").addEventListener('click', () => {
  const inputValue = document.getElementById("popup-input").value;
  selectItem = new Set(JSON.parse(inputValue));
  freshSelectItem();
  document.getElementById("popup-close").click();
})

