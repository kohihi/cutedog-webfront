import Vue from 'vue'
import './style.css'

var ajax = function(method, path, data, responseCallback) {
  if (method == "GET") {
    if (data != "") {
      var args = '?'
      for (let p in data) {
        args += p + "=" + data[p] + "&"
      }
      path += args
    }
  }
  var r = new XMLHttpRequest()
  r.open(method, SERVICE_URL + path, true)
  r.setRequestHeader('Content-Type', 'application/json')
  r.onreadystatechange = function() {
    if(r.readyState === 4) {
      responseCallback(r.response)
    }
  }
  data = JSON.stringify(data)
  r.send(data)
}

var e = function(sel) {
  return document.querySelector(sel)
}

var eAll = function(sel) {
  return document.querySelectorAll(sel)
}

var setCookie = function(c_name, value, expiredays) {
  var exdate=new Date()
  exdate.setDate(exdate.getDate()+expiredays)
  document.cookie=c_name+ "=" + escape(value)
                  +((expiredays==null) ? "" : ";expires="+exdate.toGMTString()
                  +";path=/")
}

var getCookie = function(c_name) {
  if (document.cookie.length>0) {
    var c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length+1
      var c_end = document.cookie.indexOf(";",c_start)
      if (c_end == -1) c_end=document.cookie.length
      return unescape(document.cookie.substring(c_start,c_end))
      }
    }
  return ""
}

var app = new Vue({
	el: '#app',
	data: {
		show: [],
		imgList: [],
		comments: {},
		current_page: 0,
		max_page: 0,
		current_board: 'all',
		author: 'Anonymous',
		message:"",
		alert: false,
    imgUrl: '',
    imgWords: '',
    board: 'dog',
    boardSelect: [
      {'key': '汪', 'value': 'dog'},
      {'key': '喵', 'value': 'cat'},
      {'key': '其他', 'value': 'other'},
    ],
    scrollFlag: false,
    scrollTop: 0,
	},
	mounted() {
		this.getImg(1)
		var author = getCookie('author')
		if (author != "") {
			this.author = author
		}
    window.addEventListener('scroll', this.scrollToTop)
	},
  destroyed() {
    window.removeEventListener('scroll', this.scrollToTop)
  },
	filters: {
		dateFormat: function(value) {
			var a = new Date() - new Date(value)
			a = parseInt(a/1000)
			if (a > 2592000) {
				return value.split(" ")[0]
			}
			if (a > 86400) {
				return (parseInt(a / 86400)+"天前")
			}
			if (a > 3600) {
				return(parseInt(a / 3600)+"小时前")
			}
			if (a > 60) {
				return(parseInt(a / 60)+"分钟前")
			}
			if (a > 0) {
				return(a+"秒前")
			} else {
				return("刚刚")
			}
		}
	},
	methods: {
		getImg: function(page, board='all') {
      this.closeAllComments()
			var path = `/api/image`
			var data = {
				"page": page,
				"board": board
			}
			var that = this
			ajax("GET", path, data, function(r) {
				r = JSON.parse(r)
				if (r.code == 0) {
					that.imgList = r.data
					that.current_page = page
					that.current_board = board
					that.max_page = r.next
				} else {
					alert("error:code" + r.code)
				}
			})
		},

    commentsSwitch: function(index, img_id) {
      this.show[index] = !this.show[index]
      this.show.push(false)
      this.show.pop(-1)
      if (!this.show[index]) {
        return
      }
      var path = `/api/image/comment`
      var params = {
        "img_id": img_id,
      }
      var that = this
      ajax("GET", path, params, function(r){
        r = JSON.parse(r)
        if (r.code == 0) {
          Vue.set(that.comments, params.img_id, r.data)
        } else {
          alert("error:code" + r.code)
        }
      })
    },

    closeAllComments: function() {
      this.show = []
    },

		submitUrl: function() {
      let words = ((this.imgWords.replace(/<(.+?)>/gi,"&lt;$1&gt;")).replace(/ /gi,"&nbsp;")).replace(/\n/gi,"<br>")
			const regex = /^\s*$/
			if (regex.test(this.imgUrl)) {
				return
			}
			var data = {
				"author": this.author,
				"url": this.imgUrl,
				"word": words,
				"board": this.board,
			}
			var path = `/api/image`
			var that = this
			ajax("POST", path, data, function(r) {
				r = JSON.parse(r)
				if (r.code == 0) {
            that.alertText("已提交")
            that.imgUrl = ""
            that.imgWords = ""
        } else {
            alert("error:code" + r.code)
        }
			})
		},

		submitComment: function(img_id) {
			var content = e("#CTA-"+img_id).value
			const regex = /^\s*$/
			if (regex.test(content)) {
				return
			}
			var data = {
				"img_id": img_id,
				"author": this.author,
				"content": content
			}
			var path = `/api/image/comment`
			var that = this
			ajax("POST", path, data, function(r) {
				r = JSON.parse(r)
				if (r.code == 0) {
                    that.comments[img_id].push(r.data)
                    e("#CTA-"+img_id).value = ""
                } else {
                    alert("error:code" + r.code)
                }
			})
		},

		voteW: function(img_id, index) {
			var data = {
				"img_id": img_id,
				"type": 1,
			}
			var path = `/api/vote`
			var that = this
			ajax("PUT", path, data, function(r) {
				r = JSON.parse(r)
				if (r.code == 0) {
					that.imgList[index].w += 1
					that.alertText("汪!")
				} else {
					that.alertText("已经点过汪了")
				}

			})
		},

		voteM: function(img_id, index) {
			var data = {
				"img_id": img_id,
				"type": 0,
			}
			var path = `/api/vote`
			var that = this
			ajax("PUT", path, data, function(r) {
				r = JSON.parse(r)
				if (r.code == 0) {
					that.imgList[index].m += 1
					that.alertText("喵~")
				} else {
					that.alertText("已经点过喵了")
				}

			})
		},

		setPage: function(page) {
			window.scroll(0, 0)
			if (page == "next") {
				this.getImg(this.current_page+1, this.board)
			} else if (page == "prev") {
				this.getImg(this.current_page-1, this.board)
			} else {
				this.getImg(page, this.board)
			}
		},

		setAuthor: function() {
			var a = e("#author").value
			const regex = /^\s*$/
			if (regex.test(a)) {
				alert("名字不能全是空白符")
				return
			}
			setCookie("author", a, 365)
			this.author = a
			e("#author").value = ""
		},

		alertText: function(text) {
			this.message = text
			this.alert = true
			var t = setTimeout(() => {
				this.alert = false
			}, 2000, t)
		},

    backTop: function() {
      let that = this
      let timer = setInterval(() => {
        let ispeed = Math.floor(-that.scrollTop / 5)
        document.documentElement.scrollTop = document.body.scrollTop = that.scrollTop + ispeed
        if (that.scrollTop === 0) {
          clearInterval(timer)
        }
      }, 16)
   },

    scrollToTop: function() {
      let that = this
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      that.scrollTop = scrollTop
      if (that.scrollTop > 450) {
        that.scrollFlag = true
      } else {
        that.scrollFlag = false
      }
    }
	}
})
