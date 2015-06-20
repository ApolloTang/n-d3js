d3.selectAll()
==============

http://jsbin.com/seguqojapu/1/edit

var divs = d3.selectAll('div');
divs.style('background-color', 'blue');


style()
=======

The style() method can be passed an accessor function instead
of a value. This accessor function will be called for each element
in the selector and its result will be used to set style property
we specify.

    http://jsbin.com/agibaYo/1/edit?html,output

    <body>
      <div>Hello</div>
      <div>World</div>
      <div>!</div>
      <script>
        d3.selectAll('div')
          .style('background-color', function(d, i) {
            if(Math.random() > 0.5) {
              return 'red';
            }else{
              return 'blue';
            }
          });
      </script>
    </body>

The accessor we pass to style also gets called with two arguments
The first argument is the datum
the second argument is index of the current element in the selector

    <body>
        <div>Hello</div>
        <div>World</div>
        <div>!</div>
        <script>
            d3.selectAll('div')
                .style('background-color', function(d, i) {
                    if(i === 0){
                        return 'blue';
                    } else {
                        return 'green';
                    }
            });
        </script>
    </body>

attr()
=======

attr() method that operates almost identically to style()
It follows the same calling conventions but is used to modify
attributes of the selected DOM elements:


    http://jsbin.com/uNiTovuJ/1/edit?html,output

    <body>
        <div>Hello</div>
        <div>World</div>
        <div>!</div>
    </body>

    d3.selectAll('div') .attr('width', '100%');

    <body>
        <div width="100%">Hello</div>
        <div width="100%">World</div>
        <div width="100%">!</div>
    </body>


  <script>
    d3.selectAll('div').style({
      'width': '100%',
      'height': '100%',
      'background-color': function(d, i) {
        return i % 2 === 0 ? 'red' : 'blue';
      }
    });
  </script>

<body>
    <div style="width: 100%; height: 100%; background-color: red;">Hello</div>
    <div style="width: 100%; height: 100%; background-color: blue;">World</div>
    <div style="width: 100%; height: 100%; background-color: red;">!</div>
</body>

