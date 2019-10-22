<!DOCTYPE html>
<html>
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.5/pixi.min.js"></script>
        <!-- <script src="jquery.min.js"></script> -->
        <!-- <script src="pixi.min.js"></script> -->
        <script src="bump.js"></script>

        <script src="pixi.js"></script>
        <script src="WorldGen.js"></script>
        <script src="engine.js"></script>
        <style>
            html {
                background-color: #555;
            }
            
            *, * * {
                margin: 0;
                padding: 0;
            }

            #container {
                width: 90vw;
                left: 5vw;
                position: relative;
                flex: 1 1 auto;
                z-index: 1;
            }
            
            #infoContainer {
                width: 100%;
                display: inline-flex;
                justify-content: space-between;
            }
            
            #heartsContainer {
                display: inline-flex;
                justify-content: space-between;
                border-right: 2px solid black;
                width: 50%;
            }
            
            #inventoryContainer {
                display: inline-flex;
                justify-content: space-between;
                border-left: 2px solid black;
                width: 50%;
            }
            
            .item {
                width: 8%;
                background-color: #666;
                border-radius: 50%;
                border: 2px solid #666;
            }
            .item.selected {
                background-color: #999;
                border-color: #333;
            }
            #openInv {
                border-width: 0;
                background-color: transparent;
            }
            
            .heart {
                width: 8%;
            }
            
            .hidden {
                opacity: 0;
            }
            
            #content {
                display: flex;
                flex-flow: column;
                height: 100vh;
            }
            
            #inv {
                position: fixed;
                width: 90vw;
                height: 90vh;
                background-color: red;
                z-index: 9999;
                top: 5vh;
                left: 5vw;
                display: none;
            }
            
            .visible {
                display: block !important;
            }
            
        </style>
    </head>
    <body>
        <div id="content" draggable="false">
            <div id="infoContainer">
                <div id="heartsContainer">
                    <img src="images/heart.png" class="heart heart-1" />
                    <img src="images/heart.png" class="heart heart-2" />
                    <img src="images/heart.png" class="heart heart-3" />
                    <img src="images/heart.png" class="heart heart-4" />
                    <img src="images/heart.png" class="heart heart-5" />
                    <img src="images/heart.png" class="heart heart-6" />
                    <img src="images/heart.png" class="heart heart-7" />
                    <img src="images/heart.png" class="heart heart-8" />
                    <img src="images/heart.png" class="heart heart-9" />
                    <img src="images/heart.png" class="heart heart-10" />
                </div>
                <div id="inventoryContainer">
                    <img src="images/heart.png" class="item item-1 selected" />
                    <img src="images/heart.png" class="item item-2" />
                    <img src="images/heart.png" class="item item-3" />
                    <img src="images/heart.png" class="item item-4" />
                    <img src="images/heart.png" class="item item-5" />
                    <img src="images/bag.png" id="openInv" class="item" />
                </div>
            </div>
            <div id="container"></div>
        </div>
    </body>
    </html>
