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
    const isExisted = tags.some(tag => {
      return selectList.includes(tag) || selectList.includes("全部");
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
      <div class="item">
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

freshList();