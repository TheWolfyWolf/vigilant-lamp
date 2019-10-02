<!DOCTYPE html>
<html>
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.5/pixi.min.js"></script>
    <style>
    html {
      background-color: #555;
    }

    #container {
      width: 90vw;
      height: 90vh;
      top: 5vh;
      left: 5vw;
      position: relative;
    }

    .black {
      background-color: black;
    }
    .red {
      background-color: royalblue;
    }
    td {
      width: 2vw !important;
      height: 2vw !important;
      padding: 0;
      margin: 0;
      border: 0;
      display: inline-block;
    }
    tr {
      height: 0.16vw !important;
    }
    tr,td,th,table {
      padding: 0;
      margin: 0;
      border: 0;
      border-collapse: collapse;
      border-spacing: 0;
      line-height: 0 !important;
    }
    html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
    display: block;
}
body {
    line-height: 1;
}
ol, ul {
    list-style: none;
}
blockquote, q {
    quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
    content: '';
    content: none;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
    border-width: 0px;
    width: 100%
}


    </style>
  </head>
  <body>
    <!--
    <table>
      <?php
      /*for ($y=0;$y<50;$y++) {
        echo "<tr>";
        for ($x=0;$x<50;$x++) {
          echo "<td id='" . sprintf('%04d', $x) . sprintf('%04d', $y) . "'>&nbsp;</td>";
        }
        echo "</tr>";
      }*/
       ?>
    </table>
    -->
      <div id="container"></div>

      <script src="pixi.js"></script>
    <script src="WorldGen.js"></script>
  </body>
</html>
