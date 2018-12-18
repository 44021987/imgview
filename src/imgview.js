/**
 * @param {Object} opts
 * @param {Boolean} opts.maskClose 点击遮罩层是否关闭预览
 * @param {Number} opts.maxScale 最大缩放值倍数
 * @param {Number} opts.minScale 最小缩放值倍数
 * 多图预览 {data: Array, index: Number}
 * 单个预览 {src: 'String src'}
 * @Author: xd
 * @Date:   2018-08-1
 */

import './css/imgview.css'
import loading from './img/loading.gif'

function $$(v, node) {
  node = node || document
  return node.querySelector(v)
}
const defaultOpts = {
  index: 0,
  data: [],
  maxScale: 3,
  minScale: 0.5,
  maskClose: false,
  showDowmload: false
}
const isObject = opts => Object.prototype.toString.call(opts) === '[object Object]' 

export const Imgview = function(opts) {
  if (!isObject(opts)) throw new Error('arguments type error')
  for (const key in defaultOpts) {
    if (opts[key] === undefined) opts[key] = defaultOpts[key]
  }
  this.x = 0
  this.y = 0
  this.left = 0
  this.top = 0
  this.boxWidth = 0
  this.scale = 1
  this.clientL = 0
  this.clientT = 0
  this.isMove = false
  this.showDowmload = opts.showDowmload
  this.box = null
  this.index = opts.index
  this.data = opts.data
  this.src = opts.src || this.data[this.index]
  this.maskClose = opts.maskClose
  this.maxScale = opts.maxScale
  this.minScale = opts.minScale
  this.imgWrapWidth = 0
  this.imgWrapHeight = 0
  this.minScreen = 1200
  this.imgWidthPersent = '80%'
  // 判断上一级iframe是否引入Imgview
  this.isIframe = false
  this.init()
}
Imgview.prototype.init = function() {
  var that = this
  this.setIsIframe()
  this.createImgview(function() {
    that.bindClickEvent()
    that.bindMove()
    that.bindSelect()
  })
  this.remove()
}
Imgview.prototype.setIsIframe = function() {
  try{
    this.isIframe = (self != top && !!top.Imgview)
  } catch(e) {
    this.isIframe = false;
  }
}
Imgview.prototype.createImgview = function(fn) {
  var clientW = document.documentElement.clientWidth || document.body.clientWidth
  var clientH = document.documentElement.clientHeight || document.body.clientHeight
  var oWrap = clientW > this.minScreen ? parseInt(clientW * 0.6 - 100) : parseInt(clientW * 0.8 - 100)
  var oWrapHeight = clientH - 100
  var oStyle = 'widht: 100%'
  var img = new Image()
  var imgbox = this.createdDom()
  var that = this
  this.imgWrapWidth = oWrap
  this.imgWrapHeight = oWrapHeight
  img.src = this.src
  img.onload = function() {
    var x = this.naturalWidth || this.width
    var y = this.naturalHeight || this.height
    var imgWidth = 0
    var imgHeight = 0
    var ratio = 1
    var tagImag = imgbox.querySelector('img')
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
Imgview.prototype.createdDom = function() {
  var clientW = document.documentElement.clientWidth || document.body.clientWidth
  var style = clientW > this.minScreen ? '' : 'width:' + this.imgWidthPersent
  if (this.box) {
    if (this.isIframe) {
      top.document.body.removeChild(this.box)
    } else {
      document.body.removeChild(this.box)
    }
  }
  var oBox = document.createElement('div')
  var str =
    '<div class="imgview-view" style="'+style+'"><div class="btn-wrap">' +
    '<button id="btn-add" class="imgview-btn scale-btn" title="放大">+</button>' +
    '<button id="btn-restore" class="imgview-btn scale-btn" title="还原">1</button>' +
    '<button id="btn-reduce" class="imgview-btn scale-btn" title="缩小">-</button>'
    if (this.showDowmload === true) {
    str += '<a class="imgview-btn dowmload-btn" title="下载" href="'+this.src+'" download="'+this.src.split('/').pop()+'"></a>'
  }
  if (this.data.length) {
    str +=
      '<button id="btn-prev" class="imgview-btn prev"><</button>' +
      '<button id="btn-next" class="imgview-btn next">></button>'
  }
  str +=
    '</div>' +
    '<div class="imgview-inner">' +
    '<div class="imgview-wrap">' +
    '<img class="imgview-show" style="width: 100px" src=' +loading +' />' +
    '</div>' +
    '</div>' +
    '<div class="del-box">×</div></div>'

  oBox.className = 'imgview-box'
  oBox.innerHTML = str
  if (this.isIframe) {
    // if (!top.Imgview) 
    top.document.body.appendChild(oBox)
  } else {
    document.body.appendChild(oBox)
  }
  this.box = oBox
  return oBox
}
Imgview.prototype.remove = function() {
  var that = this;
  this.box.onclick = function(e) {
    var target = e.target
    if (target === $$('.del-box', that.box) || (that.maskClose === true && target === this)) {
      if (that.isIframe) { 
        top.document.body.removeChild(this)
      } else {
        document.body.removeChild(this)
      }
      that.box = null
    }
  }
}
Imgview.prototype.bindSelect = function() {
  var oBtns = $$('.imgview-box .btn-wrap', this.box)
  var oImg = $$('.imgview-show', this.box)
  var _this = this
  var changeImg = function(target, el) {
    var num = 1
    var el = null
    if (target.id !== 'btn-prev' && target.id !== 'btn-next') return
    num = target.id === 'btn-prev' ? -1 : 1
    el = target.id === 'btn-prev' ? $$('#btn-next', _this.box) : $$('#btn-prev', _this.box)
    if (
      (num === -1 && _this.index === 0) ||
      (num === 1 && _this.index === _this.data.length - 1)
    ) {
      target.style.opacity = '0'
    } else {
      el.style.opacity = '1'
      _this.index += num
    }
    _this.scale = 1
    oImg.style.left = 0
    oImg.style.top = 0
    oImg.src = _this.data[_this.index]
    _this.src = _this.data[_this.index]
    _this.setScale(oImg, 1, 1)
    _this.init()
  }

  oBtns.addEventListener('click', function(e) {
    changeImg(e.target)
  })
}
Imgview.prototype.bindClickEvent = function() {
  var _this = this
  var oImg = $$('.imgview-show', this.box)
  var changeTransform = function() {
    if (_this.scale <= 1) {
      oImg.style.cursor = ''
    } else {
      oImg.style.cursor = 'move'
    }
    _this.setScale(oImg, _this.scale, _this.scale)
  }
  $$('#btn-add', this.box).addEventListener('click', function() {
    _this.scale += 0.35
    if (_this.scale >= _this.maxScale) _this.scale = _this.maxScale
    changeTransform()
  })
  $$('#btn-restore', this.box).addEventListener('click', function() {
    _this.scale = 1
    oImg.style.left = 0
    oImg.style.top = 0
    changeTransform()
  })
  $$('#btn-reduce', this.box).addEventListener('click', function() {
    _this.scale -= 0.35
    if (_this.scale <= _this.minScale) _this.scale = _this.minScale
    oImg.style.left = 0
    oImg.style.top = 0
    changeTransform()
  })
}

Imgview.prototype.setScale = function(el, x, y) {
  el.style.transform = 'scale3d(' + x + ', ' + y + ', 1)'
  el.style.WebkitTransform = 'scale3d(' + x + ', ' + y + ', 1)'
}
Imgview.prototype.bindMove = function() {
  var _this = this
  var doc = this.isIframe ? top.document : document
  var oImg = $$('.imgview-show', this.box)
  oImg.onmousedown = function(e) {
    var imgWidth = this.offsetWidth * _this.scale
    var imgHeight = this.offsetHeight * _this.scale
    _this.x = e.clientX
    _this.y = e.clientY
    _this.isMove = true
    _this.left = parseInt(this.style.left || 0)
    _this.top = parseInt(this.style.top || 0)
    _this.clientL = (imgWidth - this.offsetWidth) / 2
    _this.clientT = (imgHeight - this.offsetHeight) / 2
    e.preventDefault()
  }

  oImg.onmousemove = function(e) {
    // 正在移动或缩放不超过1倍的不改变位置
    if (!_this.isMove || _this.scale <= 1) return
    var imgWidth = this.offsetWidth * _this.scale
    var imgHeight = this.offsetHeight * _this.scale
    var x1 = e.clientX - _this.x + _this.left
    var y1 = e.clientY - _this.y + _this.top
    var getMoveDis = function(num, clientDis) {
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
      const maxLeft = (imgWidth - _this.imgWrapWidth)/2
      if (dis > maxLeft) dis = maxLeft
      if (dis < -maxLeft) dis = -maxLeft
      this.style.left = dis + 'px'
    }
  }
  doc.onmouseup = function(e) {
    _this.isMove = false
    _this.x = 0
    _this.y = 0
  }
}
