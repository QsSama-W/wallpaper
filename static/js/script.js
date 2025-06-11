// 日期处理函数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatDateToChinese(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// 获取今天的日期
const today = new Date();
const todayFormatted = formatDate(today);
document.getElementById('current-date').textContent = formatDateToChinese(today);
document.getElementById('current-wallpaper').src = `img/${todayFormatted}.jpg`;

// 计算半年前的日期
const halfYearAgo = new Date(today);
halfYearAgo.setMonth(today.getMonth() - 6);

// 壁纸数据
let wallpapers = [];
let currentPage = 0;
const wallpapersPerPage = 30;

// 生成壁纸数据（最多半年前）
function generateWallpapers(startPage = 0) {
  const result = [];
  for (let i = 0; i < wallpapersPerPage; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (startPage * wallpapersPerPage + i + 1));
    
    // 如果日期早于半年前，则停止生成
    if (date < halfYearAgo) {
      return result;
    }
    
    result.push({
      date: formatDate(date),
      dateChinese: formatDateToChinese(date),
      url: `img/${formatDate(date)}.jpg`
    });
  }
  return result;
}

// 检查是否还有更多壁纸可加载
function hasMoreWallpapers() {
  const lastDate = new Date(today);
  lastDate.setDate(today.getDate() - ((currentPage + 1) * wallpapersPerPage + 1));
  return lastDate >= halfYearAgo;
}

// 初始化壁纸数据
function initializeWallpapers() {
  wallpapers = generateWallpapers();
  updateLoadMoreButton();
}

// 更新查看更多按钮状态
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!hasMoreWallpapers()) {
    loadMoreBtn.innerHTML = '<i class="fa fa-calendar-check-o mr-2"></i> 已显示全部历史壁纸';
    loadMoreBtn.disabled = true;
    loadMoreBtn.classList.add('bg-gray-600');
    loadMoreBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
  } else {
    loadMoreBtn.innerHTML = '<i class="fa fa-refresh mr-2"></i> 查看更多壁纸';
    loadMoreBtn.disabled = false;
    loadMoreBtn.classList.remove('bg-gray-600');
    loadMoreBtn.classList.add('bg-gray-700', 'hover:bg-gray-600');
  }
}

// 导航切换
document.getElementById('home-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('history-view').classList.add('hidden');
  document.getElementById('home-link').classList.add('text-blue-400');
  document.getElementById('home-link').classList.remove('text-gray-300');
  document.getElementById('history-link').classList.remove('text-blue-400');
  document.getElementById('history-link').classList.add('text-gray-300');
});

document.getElementById('history-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('history-view').classList.remove('hidden');
  document.getElementById('home-link').classList.remove('text-blue-400');
  document.getElementById('home-link').classList.add('text-gray-300');
  document.getElementById('history-link').classList.add('text-blue-400');
  document.getElementById('history-link').classList.remove('text-gray-300');
  
  // 如果历史壁纸还没加载，则加载它们
  if (document.getElementById('history-gallery').children.length === 0) {
    loadHistoryWallpapers();
  }
});

// 加载历史壁纸
function loadHistoryWallpapers() {
  const gallery = document.getElementById('history-gallery');
  
  // 过滤掉今天的壁纸
  const historyWallpapers = wallpapers.filter(wallpaper => wallpaper.date !== todayFormatted);
  
  historyWallpapers.forEach((wallpaper, index) => {
    const wallpaperCard = document.createElement('div');
    wallpaperCard.className = 'bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 relative';
    wallpaperCard.style.animation = `slideIn 0.5s ease-out forwards ${index * 0.05}s`;
    wallpaperCard.innerHTML = `
      <div class="aspect-[4/3] overflow-hidden relative group">
        <img src="${wallpaper.url}" alt="${wallpaper.dateChinese}壁纸" 
             class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
        <!-- 历史壁纸下载按钮 -->
        <button class="absolute bottom-3 right-3 bg-blue-500/80 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                data-date="${wallpaper.date}">
          <i class="fa fa-download"></i>
        </button>
      </div>
      <div class="p-4">
        <h3 class="font-medium text-gray-100">${wallpaper.dateChinese}</h3>
        <p class="text-sm text-gray-400 mt-1">点击查看大图</p>
      </div>
    `;
    
    wallpaperCard.addEventListener('click', (e) => {
      // 只有点击图片区域才打开查看器
      if (!e.target.closest('button')) {
        openWallpaperViewer(wallpapers.findIndex(w => w.date === wallpaper.date));
      }
    });
    
    gallery.appendChild(wallpaperCard);
  });
  
  // 为所有历史壁纸下载按钮添加事件监听
  setupHistoryDownloadButtons();
}

// 设置历史壁纸下载按钮
function setupHistoryDownloadButtons() {
  document.querySelectorAll('#history-gallery button[data-date]').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // 防止触发图片点击事件
      const date = this.getAttribute('data-date');
      const wallpaper = wallpapers.find(w => w.date === date);
      
      if (wallpaper) {
        const link = document.createElement('a');
        link.href = wallpaper.url;
        link.download = `wallpaper_${date}.jpg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  });
}

// 加载更多历史壁纸
function loadMoreWallpapers() {
  const button = document.getElementById('load-more-btn');
  button.innerHTML = '<i class="fa fa-circle-o-notch fa-spin mr-2"></i> 加载中...';
  button.disabled = true;
  
  setTimeout(() => {
    currentPage++;
    const newWallpapers = generateWallpapers(currentPage);
    wallpapers = [...wallpapers, ...newWallpapers];
    
    const gallery = document.getElementById('history-gallery');
    const startIndex = currentPage * wallpapersPerPage;
    
    newWallpapers.forEach((wallpaper, index) => {
      const wallpaperCard = document.createElement('div');
      wallpaperCard.className = 'bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 relative';
      wallpaperCard.style.animation = `slideIn 0.5s ease-out forwards ${index * 0.05}s`;
      wallpaperCard.innerHTML = `
        <div class="aspect-[4/3] overflow-hidden relative group">
          <img src="${wallpaper.url}" alt="${wallpaper.dateChinese}壁纸" 
               class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          <!-- 历史壁纸下载按钮 -->
          <button class="absolute bottom-3 right-3 bg-blue-500/80 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  data-date="${wallpaper.date}">
            <i class="fa fa-download"></i>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-100">${wallpaper.dateChinese}</h3>
          <p class="text-sm text-gray-400 mt-1">点击查看大图</p>
        </div>
      `;
      
      wallpaperCard.addEventListener('click', (e) => {
        // 只有点击图片区域才打开查看器
        if (!e.target.closest('button')) {
          openWallpaperViewer(wallpapers.findIndex(w => w.date === wallpaper.date));
        }
      });
      
      gallery.appendChild(wallpaperCard);
    });
    
    // 为新加载的下载按钮添加事件监听
    setupHistoryDownloadButtons();
    
    // 更新按钮状态
    updateLoadMoreButton();
  }, 800);
}

// 壁纸查看器功能
let currentViewingIndex = 0;

// 打开壁纸查看器
document.getElementById('current-wallpaper').addEventListener('click', () => {
  openWallpaperViewer(0);
});

function openWallpaperViewer(index) {
  currentViewingIndex = index;
  const viewer = document.getElementById('wallpaper-viewer');
  const fullsizeImg = document.getElementById('fullsize-wallpaper');
  const dateDisplay = document.getElementById('wallpaper-date');
  
  fullsizeImg.src = wallpapers[index].url;
  fullsizeImg.alt = `${wallpapers[index].dateChinese}壁纸`;
  dateDisplay.textContent = wallpapers[index].dateChinese;
  
  viewer.classList.remove('hidden');
  viewer.classList.add('fade-in');
  
  // 防止背景滚动
  document.body.style.overflow = 'hidden';
  
  // 图片加载动画
  fullsizeImg.classList.add('scale-in');
  setTimeout(() => {
    fullsizeImg.classList.remove('scale-in');
  }, 300);
}

// 关闭壁纸查看器
document.getElementById('close-viewer').addEventListener('click', () => {
  const viewer = document.getElementById('wallpaper-viewer');
  viewer.classList.add('fade-out');
  
  setTimeout(() => {
    viewer.classList.add('hidden');
    viewer.classList.remove('fade-out');
    // 恢复背景滚动
    document.body.style.overflow = '';
  }, 300);
});

// 上一张壁纸
document.getElementById('prev-wallpaper').addEventListener('click', () => {
  currentViewingIndex = (currentViewingIndex - 1 + wallpapers.length) % wallpapers.length;
  updateViewerImage();
});

// 下一张壁纸
document.getElementById('next-wallpaper').addEventListener('click', () => {
  currentViewingIndex = (currentViewingIndex + 1) % wallpapers.length;
  updateViewerImage();
});

// 更新查看器中的图片
function updateViewerImage() {
  const fullsizeImg = document.getElementById('fullsize-wallpaper');
  const dateDisplay = document.getElementById('wallpaper-date');
  
  // 添加过渡效果
  fullsizeImg.style.opacity = '0';
  
  setTimeout(() => {
    fullsizeImg.src = wallpapers[currentViewingIndex].url;
    fullsizeImg.alt = `${wallpapers[currentViewingIndex].dateChinese}壁纸`;
    dateDisplay.textContent = wallpapers[currentViewingIndex].dateChinese;
    fullsizeImg.style.opacity = '1';
  }, 200);
}

// 键盘导航
document.addEventListener('keydown', (e) => {
  const viewer = document.getElementById('wallpaper-viewer');
  if (viewer.classList.contains('hidden')) return;
  
  if (e.key === 'Escape') {
    document.getElementById('close-viewer').click();
  } else if (e.key === 'ArrowLeft') {
    document.getElementById('prev-wallpaper').click();
  } else if (e.key === 'ArrowRight') {
    document.getElementById('next-wallpaper').click();
  }
});

// 点击背景关闭查看器
document.getElementById('wallpaper-viewer').addEventListener('click', (e) => {
  if (e.target === document.getElementById('wallpaper-viewer')) {
    document.getElementById('close-viewer').click();
  }
});

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
  initializeWallpapers();
});

// 确保当前壁纸图片加载完成后才添加点击事件
document.getElementById('current-wallpaper').addEventListener('load', function() {
  this.style.cursor = 'pointer';
});

if (document.getElementById('current-wallpaper').complete) {
  document.getElementById('current-wallpaper').style.cursor = 'pointer';
}

// 下载壁纸功能
document.getElementById('download-btn').addEventListener('click', function() {
  const imgUrl = document.getElementById('current-wallpaper').src;
  const fileName = `wallpaper_${todayFormatted}.jpg`;
  
  const link = document.createElement('a');
  link.href = imgUrl;
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 加载更多按钮事件
document.getElementById('load-more-btn').addEventListener('click', loadMoreWallpapers);    