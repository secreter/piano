(function (argument) {
  'use strict'
  const WHITE_NUM = 14, BLACK_NUM = 10, IS_PC = typeof window.ontouchstart === 'undefined'
  let UNIT = 'vw'  // 根据屏幕方向来设置单位
  // let UNIT = 'px'  // 根据屏幕方向来设置单位
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  let baseAudioBuffer
  // 平均律周波数比(近似値)
  let frequencyRatioTempered = 1.059463
  rotateScreen()

  loadSound()
  let evt = 'onorientationchange' in window ? 'orientationchange' : 'resize'
  window.addEventListener(evt, rotateScreen, false)
  // 移动端保持横屏
  function rotateScreen () {
    let width = document.documentElement.clientWidth
    let height = document.documentElement.clientHeight
    if (width < height) {
      // 竖屏
      UNIT = 'vh'
    } else {
      UNIT = 'vw'
    }
    drawPiano()
  }
  function drawPiano () {
  // 白色、黑色琴键宽度,单位vw
    const liWhiteWidth = 100 / WHITE_NUM, liBlackWidth = liWhiteWidth * 0.5
    let keyArrW = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', '\'']
    let keyArrB = ['1', '2', '', '3', '4', '5', '', '6', '7', '', '8', '9', '0']
    let ulWhite = document.querySelector('.keyboard__white')
    let ulBlack = document.querySelector('.keyboard__black')
    ulWhite.innerHTML = ''  // 清空
    ulBlack.innerHTML = ''
    for (let i = 1; i <= WHITE_NUM; i++) {
      let liWhite = document.createElement('li')
      liWhite.setAttribute('class', 'keyboard__white__btn')
      liWhite.setAttribute('data-index', i)
      liWhite.setAttribute('data-type', 'white')
      liWhite.innerHTML = keyArrW[i - 1]
      ulWhite.appendChild(liWhite)
    }
    // let liWhite = document.querySelector('.keyboard__white__btn')
    // const liWhiteWidth = liWhite.offsetWidth, liBlackWidth = liWhiteWidth * 0.5
    for (let i = 1; i <= WHITE_NUM; i++) {
    // 每一个音阶里2,6位置没有黑色琴键
      if (i % 7 == 3 || i % 7 == 0) {
        continue
      }
      let liBlack = document.createElement('li')

      let liBlackStyle = [
        'width:' + liBlackWidth + UNIT,
        'top:0',
        'left:' + (i * liWhiteWidth - 0.25 * liWhiteWidth) + UNIT
      ]
      liBlack.setAttribute('class', 'keyboard__black__btn')
      liBlack.setAttribute('data-index', i + 0.5)
      liBlack.setAttribute('data-type', 'black')
      liBlack.setAttribute('style', liBlackStyle.join(';'))
      liBlack.innerHTML = keyArrB[i - 1]
      ulBlack.appendChild(liBlack)
    }
    let eventType = IS_PC ? 'click' : 'touchstart'
    ulWhite.addEventListener(eventType, clickKeyboard, false)
    ulBlack.addEventListener(eventType, clickKeyboard, false)
    document.addEventListener('keydown', pressKeyboard, false)
  }
  function clickKeyboard (e) {
    let ele = e.target
    toggleClass(ele)
    console.log(e.target.dataset.index)
    createSound(e.target.dataset.index)
  }
  /**
   * 通过增删class来控制keyboard的样式
   * @param  {element}
   * @return {null}
   */
  function toggleClass (ele) {
    if (ele.dataset.type === 'white') {
      ele.classList.add('keyboard__white__btn--press')
      setTimeout(function () {
        ele.classList.remove('keyboard__white__btn--press')
      }, 200)
    } else {
      ele.classList.add('keyboard__black__btn--press')
      setTimeout(function () {
        ele.classList.remove('keyboard__black__btn--press')
      }, 200)
    }
  }
  function pressKeyboard (e) {
    e = e || window.event
    // 键盘字母第一排的keycode
    let keyMap = {
      81: 1,
      87: 2,
      69: 3,
      82: 4,
      84: 5,
      89: 6,
      85: 7,
      73: 8,
      79: 9,
      80: 10,
      219: 11,
      221: 12,
      220: 13,
      222: 14,
      // ///////////////
      // 数字1-0的keycode
      49: 1.5,
      50: 2.5,
      51: 4.5,
      52: 5.5,
      53: 6.5,
      54: 8.5,
      55: 9.5,
      56: 11.5,
      57: 12.5,
      48: 13.5
    }
    let ele = document.querySelector("[data-index='" + keyMap[e.keyCode] + "']")
    toggleClass(ele)
    createSound(keyMap[e.keyCode])
    // console.log(e.keyCode)
  }
  function loadSound () {
    let request = new XMLHttpRequest()
    request.open('GET', './audio/1.mp3', true)
    // 返回的是二进制音频文件
    request.responseType = 'arraybuffer'

    // Decode asynchronously
    request.onload = function () {
      audioCtx.decodeAudioData(request.response, function (buffer) {
        baseAudioBuffer = buffer
        // console.log(buffer)
      }, function (e) {
        alert(e.err)
      })
    }
    request.send()
  }
  function createSound (index) {
    if (isNaN(Number(index))) {
      console.warn('非法数字')
      return
    }
    var bufferSource
    bufferSource = audioCtx.createBufferSource()
    bufferSource.buffer = baseAudioBuffer
    // bufferSource.playbackRate.value = frequencyRatio
    bufferSource.playbackRate.value = Math.pow(frequencyRatioTempered, index).toFixed(4)
    bufferSource.connect(audioCtx.destination)
    bufferSource.start(0)
  }
})()

