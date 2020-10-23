/**
 * @description 简单的图片预览
 * @param {Object} opts
 * @param {Boolean} opts.maskClose 点击遮罩层是否关闭预览
 * @param {Number} opts.maxScale 最大缩放值倍数
 * @param {Number} opts.minScale 最小缩放值倍数
 * @param {Function} opts.downloadFormat 下载时用
 * 多图预览 {data: Array, index: Number}
 * 单个预览 {src: 'String src'}
 * @Author: xd
 * @Date:   2018-08-1
 */

import './css/imgview.css'
import loading from './img/loading.gif'

function $$ (v, node) {
  node = node || document
  return node.querySelector(v)
}

// 获取挂载dom
function getParent (context) {
  const _document = context.isIframe ? top.document.body : document.body
  const _defaultParent = context.config.parent
  return (_defaultParent && _defaultParent.nodeType) ? _defaultParent : _document
}
// 默认配置
const defaultOpts = {
  // 多张图片切换时默认展示的图片下标
  index: 0,
  // 待预览图片数组
  data: [],
  // 是否显示下载按钮
  showDowmload: false,
  // 是否显示旋转按钮
  showRotate: true,
  // 是否显示关闭按钮
  showClose: true,
  // 是否显示缩放按钮
  showscale: true,
  // 点击遮罩是否关闭
  maskClose: false,
  // 最大缩放
  maxScale: 3,
  // 最小缩放
  minScale: 0.5,
  // 遮罩的背景颜色，内嵌的某些场景用
  bgColor: null,
  // 下载针对url的format
  downloadFormat: (src) => src
}
// 检测是否为对象类型
const isObject = (opts) => Object.prototype.toString.call(opts) === '[object Object]'


/**
 * @constructor
 * @param {*} opts 配置
 */
export const Imgview = function (opts) {
  if (!isObject(opts)) throw new Error('arguments type error')
  for (const key in defaultOpts) {
    if (opts[key] === undefined) { opts[key] = defaultOpts[key] }
  }
  const { src, index, data } = opts
  this.config = opts
  this.x = 0
  this.y = 0
  this.left = 0
  this.top = 0
  this.boxWidth = 0
  this.scale = 1
  this.clientL = 0
  this.clientT = 0
  this.isMove = false
  this.box = null
  this.data = data
  this.index = this.currentIndex(index)
  this.src = src || data[this.index]
  this.imgWrapWidth = 0
  this.imgWrapHeight = 0
  this.minScreen = 1200
  this.imgWidthPersent = '80%'
  // 判断上一级iframe是否引入Imgview
  this.isIframe = false
  this.init()
}
Imgview.prototype.init = function () {
  this.setIsIframe()
  this.createImgview(() => {
    this.bindClickEvent()
    this.bindMove()
    // 绑定图片切换事件
    this.data && this.data.length && this.bindSelect()
  })
  this.bindRemove()
}

// 判断当前是否在iframe中打开
Imgview.prototype.setIsIframe = function () {
  try {
    this.isIframe = (self != top && !!top.Imgview)
  } catch (e) {
    this.isIframe = false;
  }
}

// 创建dom
Imgview.prototype.createImgview = function (fn) {
  const clientW = document.documentElement.clientWidth || document.body.clientWidth
  const clientH = document.documentElement.clientHeight || document.body.clientHeight
  const oWrap = clientW > this.minScreen ? parseInt(clientW * 0.6 - 100) : parseInt(clientW * 0.8 - 100)
  const oWrapHeight = clientH - 100
  const oStyle = 'widht: 100%'
  const img = new Image()
  const imgbox = this.createdDom()
  const that = this
  this.imgWrapWidth = oWrap
  this.imgWrapHeight = oWrapHeight
  img.src = this.src
  img.onload = function () {
    const x = this.naturalWidth || this.width
    const y = this.naturalHeight || this.height
    const tagImag = imgbox.querySelector('img')
    let imgWidth = 0
    let imgHeight = 0
    let ratio = 1
    if (!x || !y) return
    ratio = x / y
    if (ratio < 1) {
      // 计算图片宽高比
      imgWidth = parseInt(oWrap * ratio)
      imgHeight = parseInt((imgWidth * y) / x)
      // 如果图片高度比显示器高度大，继续计算
      if (imgHeight > oWrapHeight) {
        const ratio = oWrapHeight / imgHeight
        imgWidth = parseInt(imgWidth * ratio)
        imgHeight = oWrapHeight
      }
      tagImag.style.width = imgWidth + 'px'
      tagImag.style.height = imgHeight + 'px'
    } else {
      tagImag.style.width = '100%'
    }
    tagImag.src = this.src
    fn && fn.call(that, oStyle)
  }
}

// 创建预览层dom
Imgview.prototype.createdDom = function () {
  const clientW = document.documentElement.clientWidth || document.body.clientWidth
  let style = clientW > this.minScreen ? '' : 'width:' + this.imgWidthPersent
  const parent = getParent(this)
  parent.style.overflow = 'auto'
  // 有指定父级的情况
  if (this.config.parent) {
    const _$box = [...parent.querySelectorAll('.imgview-box')]
    _$box.forEach(v => parent.removeChild(v))
  } else {
    if (this.box) {
      try {
        parent.removeChild(this.box)
      } catch (error) {
        console.error(error)
      }
    }
  }
  const oBox = document.createElement('div')
  const { showscale, showRotate, showDowmload, showClose, downloadFormat, bgColor } = this.config
  if (typeof bgColor === 'string') {
    oBox.style.backgroundColor = bgColor
  }
  let str = `<div class="imgview-view" style="${style}"><div class="btn-wrap">`

  if (showscale !== false) {
    str += `<button data-id="bigger" class="imgview-btn scale-btn" title="放大">+</button>
      <button data-id="reset" class="imgview-btn scale-btn" title="还原">1</button>
      <button data-id="small" class="imgview-btn scale-btn" title="缩小">-</button>`
  }
  if (showRotate !== false) {
    str += `
    <button data-id="l" class="imgview-btn imgview-btn-rotate" title="顺时针旋转"></button>
    <button data-id="r" class="imgview-btn imgview-btn-rotate" title="逆时针旋转"></button>
    `
  }
  if (showDowmload === true) {
    str += '<a class="imgview-btn dowmload-btn" title="下载" href="' + downloadFormat(this.src, this.index) + '" download="' + this.src.split('/').pop() + '"></a>'
  }
  if (this.data.length) {
    str += `
    <button id="imgview-btn-prev" class="imgview-btn prev ${this.index === 0 ? 'imgview-not-allowed' : ''}"><</button>
    <button id="imgview-btn-next" class="imgview-btn next  ${this.index === this.data.length - 1 ? 'imgview-not-allowed' : ''}">></button>
    `
  }
  str +=
    '</div>' +
    '<div class="imgview-inner">' +
    '<div class="imgview-wrap">' +
    '<img class="imgview-show" style="width: 100px" src=' + loading + ' />' +
    '</div>' +
    '</div>'
  if (showClose !== false) {
    str += '<div class="imgview-del-icon">×</div>'
  }
  str += '</div>'
  oBox.className = 'imgview-box'
  oBox.innerHTML = str
  try {
    parent.appendChild(oBox)
    parent.style.overflow = 'hidden'
  } catch (error) {
    console.error(error)
  }
  this.box = oBox
  return oBox
}
Imgview.prototype.bindRemove = function () {
  const that = this;
  this.box.onclick = function (e) {
    const target = e.target
    if (target === $$('.imgview-del-icon', that.box) || (that.config.maskClose === true && target === this)) {
      const parent = that.isIframe ? top.document.body : document.body
      parent.style.overflow = 'auto'
      parent.removeChild(this)
      that.box = null
    }
  }
}

// 当前显示的图片index
Imgview.prototype.currentIndex = function (num) {
  const maxLen = this.data.length - 1
  return num < 0 ? 0 : (num > maxLen ? maxLen : num)
}

// 多图片时，绑定切换按钮
Imgview.prototype.bindSelect = function () {
  const BtnWrap = $$('.imgview-box .btn-wrap', this.box)
  const oImg = $$('.imgview-show', this.box)
  const _this = this
  const btns = BtnWrap.querySelectorAll('.imgview-btn')
  const changeImg = function (target) {
    // 上一张按钮
    const isPrev = target.id === 'imgview-btn-prev'
    // 下一张按钮
    const isNext = target.id === 'imgview-btn-next'
    if (!isPrev && !isNext) return
    const num = isPrev ? _this.index - 1 : _this.index + 1
    // 获取按钮
    // const el = $$(`#imgview-btn-${isPrev ? 'prev' : 'next'}`, _this.box)
    // 第一张或者最后一张时隐藏按钮
    const maxLen = _this.data.length - 1
    _this.index = _this.currentIndex(num)
    btns.forEach((v) => {
      v.classList.remove('imgview-not-allowed')
    })
    if (
      (isPrev && _this.index === 0) ||
      (isNext && _this.index === maxLen)
    ) {
      target.classList.add('imgview-not-allowed')
    }
    _this.scale = 1
    oImg.style.left = 0
    oImg.style.top = 0
    oImg.src = _this.data[_this.index]
    _this.src = _this.data[_this.index]
    _this.setScale(oImg, 1, 1)
    _this.init()
  }

  BtnWrap.addEventListener('click', function (e) {
    changeImg(e.target)
  })
}

// 绑定事件
Imgview.prototype.bindClickEvent = function () {
  const _this = this
  const oImg = $$('.imgview-show', this.box)
  var changeTransform = function () {
    if (_this.scale <= 1) {
      oImg.style.cursor = ''
    } else {
      oImg.style.cursor = 'move'
    }
    _this.setScale(oImg, _this.scale, _this.scale)
  }
  this.box.addEventListener('click', function (e) {
    const id = e.target.getAttribute('data-id')
    // 旋转
    if (~['l', 'r'].indexOf(id)) {
      const val = id === 'l' ? 90 : -90
      const currentDeg = oImg.getAttribute('data-deg') | 0
      const deg = currentDeg + val
      oImg.setAttribute('data-deg', deg)
      oImg.style.transform = `rotate(${deg}deg)`
      oImg.style.left = 0
      oImg.style.top = 0
      return
    }
    // 放大
    if (id === 'bigger') {
      _this.scale += 0.35
      if (_this.scale >= _this.config.maxScale) _this.scale = _this.config.maxScale
      changeTransform()
      return
    }
    // 还原
    if (id === 'reset') {
      _this.scale = 1
      oImg.style.left = 0
      oImg.style.top = 0
      changeTransform()
      return
    }
    // 缩小
    if (id === 'small') {
      _this.scale -= 0.35
      if (_this.scale <= _this.config.minScale) _this.scale = _this.config.minScale
      oImg.style.left = 0
      oImg.style.top = 0
      changeTransform()
      return
    }
  })
}

// 设置缩放比
Imgview.prototype.setScale = function (el, x, y) {
  // 获取旋转角度
  const currentDeg = el.getAttribute('data-deg') | 0
  el.style.transform = `scale3d(${x},${y}, 1) rotate(${currentDeg}deg)`
  el.style.WebkitTransform = `scale3d(${x},${y}, 1) rotate(${currentDeg}deg)`
}

// 拖拽
Imgview.prototype.bindMove = function () {
  const _this = this
  const doc = this.isIframe ? top.document : document
  const oImg = $$('.imgview-show', this.box)
  oImg.onmousedown = function (e) {
    const imgWidth = this.offsetWidth * _this.scale
    const imgHeight = this.offsetHeight * _this.scale
    _this.x = e.clientX
    _this.y = e.clientY
    _this.isMove = true
    _this.left = parseInt(this.style.left || 0)
    _this.top = parseInt(this.style.top || 0)
    _this.clientL = (imgWidth - this.offsetWidth) / 2
    _this.clientT = (imgHeight - this.offsetHeight) / 2
    e.preventDefault()
  }

  oImg.onmousemove = function (e) {
    // 正在移动或缩放不超过1倍的不改变位置
    if (!_this.isMove || _this.scale <= 1) return
    const imgWidth = this.offsetWidth * _this.scale
    const imgHeight = this.offsetHeight * _this.scale
    const x1 = e.clientX - _this.x + _this.left
    const y1 = e.clientY - _this.y + _this.top
    const getMoveDis = function (num, clientDis) {
      if (num > clientDis || num < -clientDis) {
        num > 0 ? (num = clientDis) : (num = -clientDis)
      }
      return num
    }

    if (imgHeight > _this.imgWrapHeight) {
      this.style.top = getMoveDis(y1, _this.clientT) + 'px'
    }
    if (imgWidth > _this.imgWrapWidth) {
      let dis = getMoveDis(x1, _this.clientL)
      const maxLeft = (imgWidth - _this.imgWrapWidth) / 2
      if (dis > maxLeft) dis = maxLeft
      if (dis < -maxLeft) dis = -maxLeft
      this.style.left = dis + 'px'
    }
  }
  doc.onmouseup = function (e) {
    _this.isMove = false
    _this.x = 0
    _this.y = 0
  }
}
