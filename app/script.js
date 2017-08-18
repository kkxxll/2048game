function Game(win) {
  this.board = new Array();
  this.score = 0;


  this.startx = 0;
  this.starty = 0;
  this.endx = 0;
  this.endy = 0;


  //兼容移动
  this.documentWidth = win.screen.availWidth;
  this.gridContainerWidth = 0.92*this.documentWidth;
  this.cellSideLength = 0.18*this.documentWidth; //格子
  this.cellSpace = 0.04*this.documentWidth; //格子间隙  (92％-4*18％)/5 ＝ 4% = 0.04

  this.ready = function() {
    this.prepareForMobile();
    this.newgame();
  }

  this.prepareForMobile = function() {
    if(this.documentWidth>500) {
      this.gridContainerWidth = 500;
      this.cellSpace = 20;
      this.cellSideLength = 100;
    }
    $("#grid-container").css({
      'width': this.gridContainerWidth-2*this.cellSpace+'px',
      'height': this.gridContainerWidth-2*this.cellSpace+'px',
      'padding': this.cellSpace+'px',
      'borderRadius': 0.02*this.gridContainerWidth+'px'
    });

    $(".grid-cell").css({
      'width': this.cellSideLength+'px',
      'height': this.cellSideLength+'px',
      'borderRadius': 0.02*this.gridContainerWidth+'px'
    });
  }

  this.newgame =  function() {
    this.init();
    this.generateOneNumber();
    this.generateOneNumber();
  }

  this.init = function() {
    for(var i=0;i<4;i++) {
      for(var j=0;j<4;j++) {
        var gridCell = $("#grid-cell-"+i+"-"+j);
        gridCell.css('top', this.getPosTop(i,j));
        gridCell.css('left', this.getPosLeft(i,j));
      }
    }


    for(var i=0;i<4;i++) {
      this.board[i] = new Array();
      for(var j=0;j<4;j++) {
        this.board[i][j]=0;
      }
    }

    //数组同步到视图中
    this.updateBoardView();
    this.score = 0;
  }
  this.updateBoardView = function() {
    $(".number-cell").remove();
    for(var i=0;i<4;i++) {
      for(var j=0;j<4;j++) {
        $("#grid-container").append('<div class="number-cell" id="number-cell-'+i+"-"+j+'"></div>');
        var theNumberCell = $("#number-cell-"+i+"-"+j);



        if(this.board[i][j]==0) {
          theNumberCell.css('width', '0px');
          theNumberCell.css('height', '0px');

          theNumberCell.css('top', this.getPosTop(i,j)+this.cellSideLength/2+'px');
          theNumberCell.css('left', this.getPosLeft(i,j)+this.cellSideLength/2+'px');
        }else {
          theNumberCell.css('width', this.cellSideLength);
          theNumberCell.css('height', this.cellSideLength);

          theNumberCell.css('top', this.getPosTop(i,j)+'px');
          theNumberCell.css('left', this.getPosLeft(i,j)+'px');

          theNumberCell.css('background-color', this.getNumberBackgroundColor(this.board[i][j]));
          theNumberCell.css('color', this.getNumberColor(this.board[i][j]));

          theNumberCell.text(this.board[i][j]);
        }


        if(this.board[i][j]>=1024) {
          theNumberCell.css({
            'fontSize': 0.4*this.cellSideLength+'px'
          });
        }else {
          theNumberCell.css({
            'fontSize': 0.6*this.cellSideLength+'px'
          });
        }
      }
    }
    $('.number-cell').css({
      'lineHeight': this.cellSideLength+'px'
    });
  }


  this.generateOneNumber = function() {
    if(this.nospace(this.board)){
      return false;
    }else {
      var randx,randy;
      do{
        randx = parseInt(Math.floor(Math.random()*4));
        randy = parseInt(Math.floor(Math.random()*4));
      }while(this.board[randx][randy]!=0)


      var randNumber = Math.random()<0.5?2:4;

      this.board[randx][randy] = randNumber;
      this.showNumberWithAnimation(randx,randy,randNumber);

      return true;
    }
  }

  this.moveLeft = function() {
    var that = this;
    if(!this.canMoveLeft(this.board)) {
      return false;
    }else {
      for(var i=0;i<4;i++) {
        var idx = 0;
        for(var j=1;j<4;j++) {
          if(this.board[i][j]!=0) {

            //遍历其所有左侧位置
            for(var k=idx;k<j;k++) {
              if(this.board[i][k]==0&&this.noHorizontal(i,k,j,this.board)) {
                //move
                this.showMoveAnimation(i,j,i,k);
                //reset
                this.board[i][k] = this.board[i][j];
                this.board[i][j] = 0;
                continue;
              }else if(this.board[i][k]==this.board[i][j]&&this.noHorizontal(i,k,j,this.board)) {
                //move
                this.showMoveAnimation(i,j,i,k);
                //add reset
                this.board[i][k] += this.board[i][j];
                this.board[i][j] = 0;
                idx++;//防止重复相加

                this.score += this.board[i][k];
                this.updateScore(this.score);
                continue;
              }
            }
          }
        }
      }
    }

    //更新  还没有完成移动动画就会更新
    //200为showMoveAnimation 中的动画时间
    setTimeout(function() {
      that.updateBoardView.apply(that,[]);
    },200);
    return true;
  }

  this.moveRight = function() {
    var that = this;
    if(!this.canMoveRight(this.board)) {

      return false;
    }else{

      for(var i=0;i<4;i++) {

        var idx = 3;
        for(var j=2;j>-1;j--) {
          if(this.board[i][j]!=0) {
            for(var k=idx;k>j;k--) {
              if(this.board[i][k]==0&&this.noHorizontal(i,j,k,this.board)) {
                this.showMoveAnimation(i,j,i,k);
                this.board[i][k] = this.board[i][j];
                this.board[i][j] = 0;
                continue;
              }else if(this.board[i][k]==this.board[i][j]&&this.noHorizontal(i,j,k,this.board)) {
                this.showMoveAnimation(i,j,i,k);
                //add reset
                this.board[i][k] += this.board[i][j];
                this.board[i][j] = 0;
                idx--;
                this.score += this.board[i][k];
                this.updateScore(this.score);
                continue;
              }
            }
          }

        }
      }

    }
    setTimeout(function() {
      that.updateBoardView.apply(that,[]);
    },200);
    return true;
  }


  this.moveUp = function() {
    var that = this;
    if(!this.canMoveUp(this.board)) {
      return false;
    }else {
      for(var j=0;j<4;j++) {
        var idx = 0;
        for(var i=1;i<4;i++) {
          if(this.board[i][j]!=0) {

            for(var k=idx;k<i;k++) {
              if(this.board[k][j]==0&&this.noVertical(j,k,i,this.board)) {
                //move
                this.showMoveAnimation(i,j,k,j);
                //reset
                this.board[k][j] = this.board[i][j];
                this.board[i][j] = 0;
                continue;
              }else if(this.board[k][j]==this.board[i][j]&&this.noVertical(j,k,i,this.board)) {
                //move
                this.showMoveAnimation(i,j,k,j);
                //add reset
                this.board[k][j] += this.board[i][j];
                this.board[i][j] = 0;
                idx++;
                this.score += this.board[k][j];
                this.updateScore(this.score);
                continue;
              }
            }
          }
        }
      }
    }
    setTimeout(function() {
      that.updateBoardView.apply(that,[]);
    },200);
    return true;
  }

  this.moveDown = function() {
    var that = this;
    if(!this.canMoveDown(this.board)) {
      return false;
    }else {
      for(var j=0;j<4;j++) {
        var idx = 3;
        for(var i=2;i>-1;i--) {
          if(this.board[i][j]!=0) {

            for(var k=idx;k>i;k--) {
              if(this.board[k][j]==0&&this.noVertical(j,i,k,this.board)) {
                //move
                this.showMoveAnimation(i,j,k,j);
                //reset
                this.board[k][j] = this.board[i][j];
                this.board[i][j] = 0;
                continue;
              }else if(this.board[k][j]==this.board[i][j]&&this.noVertical(j,i,k,this.board)) {
                //move
                this.showMoveAnimation(i,j,k,j);
                //add reset
                this.board[k][j] += this.board[i][j];
                this.board[i][j] = 0;
                idx--;
                this.score += this.board[k][j];
                this.updateScore(this.score);
                continue;
              }
            }
          }
        }
      }
    }
    setTimeout(function() {
      that.updateBoardView.apply(that,[]);
    },200);
    return true;
  }




  this._event = function() {
    var that = this;
    $(document).keydown(function(event) {

      switch(event.keyCode) {
        case 37:
          event.preventDefault();
          if(that.moveLeft.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
          break;
        case 38:
          event.preventDefault();
          if(that.moveUp.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
          break;
        case 39:
          event.preventDefault();
          if(that.moveRight.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
          break;
        case 40:
          event.preventDefault();
          if(that.moveDown.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
          break;
        default:
          break;
      }
    });


    document.addEventListener('touchstart', function(event) {
      // event.preventDefault();
      that.startx = event.touches[0].pageX;
      that.starty = event.touches[0].pageY;
      return false;
    });
    document.addEventListener('touchend', function(event) {
      // event.preventDefault();
      that.endx = event.changedTouches[0].pageX;
      that.endy = event.changedTouches[0].pageY;
      var deltax = that.endx-that.startx;
      var deltay = that.endy-that.starty;
      var flag;

      if((Math.abs(deltax)<0.3*that.documentWidth)&&(Math.abs(deltay)<0.3*that.documentWidth)) {
        return ;
      }

      if(Math.abs(deltax)>=Math.abs(deltay)){ //x轴上运动
        if(deltax>0) { //right
          if(that.moveRight.apply(that,[])) {

            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
        }else { //left
          if(that.moveLeft.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
        }
      }else {// y轴上运动
        if(deltay>0) { //down
          if(that.moveDown.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
        }else { //up
          if(that.moveUp.apply(that,[])) {
            setTimeout(function() {
              that.generateOneNumber.apply(that,[]);
            },210);
            setTimeout(function() {
              that.isgameover.apply(that,[]);
            },300);
          }
        }
      }
      return false;
    });
    document.addEventListener('touchmove', function(event) {
      event.preventDefault();
    })
  }



  this.isgameover = function() {
    if(this.nomove()){
      this.gameover();
    }
  }


  this.gameover = function() {
    alert('gameover');
  }

  this.ready();
  this._event();
}









function Support() {

  this.getPosTop = function(i,j) {
    return this.cellSpace+i*(this.cellSpace+this.cellSideLength);
  }

  this.getPosLeft = function(i,j) {
    return this.cellSpace+j*(this.cellSpace+this.cellSideLength);
  }


  this.getNumberBackgroundColor = function(number) {
    switch(number) {
      case 2: return '#eee4da'; break;
      case 4: return '#ede0c8'; break;
      case 8: return '#f2b179'; break;
      case 16: return '#f59563'; break;
      case 32: return '#f67c5f'; break;
      case 64: return '#edcf72'; break;
      case 128: return '#edcc61'; break;
      case 256: return '#9c0'; break;
      case 512: return '#33b5e5'; break;
      case 1024: return '#09c'; break;
      case 2048: return '#a6c'; break;
      case 4096: return '#93c'; break;
      case 8192: return '#f65e3b'; break;
      default: return '#777';
    }

  }


  this.getNumberColor = function(number) {
    if(number<=4) {
      return "#776e65";
    }else {
      return "white";
    }
  }


  this.nospace = function(board) {
    for(var i=0;i<4;i++) {
      for(var j=0;j<4;j++) {
        if(board[i][j]==0){
          return false;
        }
      }
    }
    return true;
  }



  this.canMoveLeft = function(board) {
    for(var i=0;i<4;i++) {
      for(var j=1;j<4;j++) {
        if(board[i][j]!=0) {
          if(board[i][j-1]==0||board[i][j-1]==board[i][j]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  this.canMoveRight = function(board) {
    for(var i=0;i<4;i++) {
      for(var j=2;j>-1;j--) {
        if(board[i][j]!=0) {
          if(board[i][j+1]==0||board[i][j]==board[i][j+1]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  this.canMoveUp = function(board) {
    for(var j=0;j<4;j++) {
      for(var i=1;i<4;i++) {
        if(board[i][j]!=0) {
          if(board[i-1][j]==0||board[i-1][j]==board[i][j]) {
            return true;
          }
        }
      }
    }
    return false;
  }


  this.canMoveDown = function(board) {
    for(var j=0;j<4;j++) {
     for(var i=2;i>-1;i--) {
        if(board[i][j]!=0) {
          if(board[i+1][j]==0||board[i+1][j]==board[i][j]) {
            return true;
          }
        }
      }
    }
    return false;
  }


  this.noHorizontal = function(row, col1,col2,board) {
    for(var i=col1+1;i<col2;i++) {
      if(board[row][i]!=0) {
        return false;
      }
    }
    return true;
  }


  this.noVertical  = function(col, row1,row2,board) {
    for(var i=row1+1;i<row2;i++) {
      if(board[i][col]!=0) {
        return false;
      }
    }
    return true;
  }

  this.nomove = function() {
    if(this.canMoveUp(this.board)||this.canMoveRight(this.board)||this.canMoveDown(this.board)||this.canMoveLeft(this.board)) {
      return false;
    }
    return true;
  }


}




function Animate() {
  this.showNumberWithAnimation = function(i,j,randNumber) {
    var numberCell = $('#number-cell-'+i+'-'+j);
    numberCell.css('background-color', this.getNumberBackgroundColor(randNumber));
    numberCell.css('color', this.getNumberColor(randNumber));

    numberCell.text(randNumber);

    numberCell.animate({
      width: this.cellSideLength,
      height: this.cellSideLength,
      top: this.getPosTop(i,j),
      left: this.getPosLeft(i,j)
    },50);
  }

  this.showMoveAnimation = function(fromx, fromy, tox, toy) {
    var numberCell = $("#number-cell-"+fromx+'-'+fromy);
    numberCell.animate({
      top: this.getPosTop(tox, toy),
      left: this.getPosLeft(tox, toy)
    },200);
  }


  this.updateScore = function(score) {
    $('#score').text(score);
  }

}


Support.prototype = new Animate();
Game.prototype = new Support();
