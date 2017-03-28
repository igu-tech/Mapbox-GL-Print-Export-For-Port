'use strict';

// in inches
var default_height = 7.3,
    large_height = 9.5,
    legend_width = 2.5;

const DEFAULT_HEIGHT = default_height * 72;
const DEFAULT_WIDTH = 792;
const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

const LARGE_HEIGHT = large_height * 72;
const LARGE_WIDTH = 1224 - (legend_width * 72);
const LARGE_RATIO = LARGE_WIDTH / LARGE_HEIGHT;

const MARGINS = 20;

function PrintControl(options) {
  this.options = options;
}

PrintControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group print';

    this._printBtn = document.createElement('button');
    this._printBtn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-print';

    this._container.appendChild(this._printBtn);
    this._container.style.display = 'none';

    this.onReady(map);

    return this._container;
}

PrintControl.prototype.onRemove = function() {
    this.container.parentNode.removeChild(this.container);
    this._map = null;
    return this;
}

PrintControl.prototype.onReady = function(map) {
    var that = this;

    var layersLoaded = function() {
        if (map.loaded()) {
            that._printBtn.setAttribute('data-toggle', 'modal');
            that._printBtn.setAttribute('data-target', '#map-print-modal') // #map-print-modal is the DOM  ID
            that._printBtn.addEventListener('mousedown', that.initializeCropper.bind(that));

            // export-map is the primary button within the map-print-modal
            document.querySelector('#export-map').addEventListener('mousedown', that.onPrintDown.bind(that));
            that._container.style.display = 'block';
            map.off('render', layersLoaded);

            that.watchDimensions();
        }
    }

    map.on('render', layersLoaded);
}

PrintControl.prototype.watchDimensions = function(map) {
    var that = this;

    $(document).ready(function() {
        $('input[type=radio][name=dimensions]').change(function() {
            if (this.value === 'default') {
                that.cropper.cropper('setAspectRatio', DEFAULT_RATIO)
            }
            else if (this.value == 'large') {
                that.cropper.cropper('setAspectRatio', LARGE_RATIO)
            }
        });
    });
}


PrintControl.prototype.initializeCropper = function (e) {
    if (this.cropper && this.cropper.cropper()) {
        this.cropper.cropper('destroy');
    }

    var exportView = $('#export-view');
    exportView.attr('src', map.getCanvas().toDataURL());
    exportView.css('max-width', '100%')

    this.cropper = exportView.cropper({
        aspectRatio: DEFAULT_RATIO,
        zoomable: false,
        zoomOnWheel: false,
        minContainerHeight: 300,
        minContainerWidth: 568,
    })
}

PrintControl.prototype.onPrintDown = function (e) {
    var _this = this;

    var type = $("form#print-form .format input[type='radio']:checked").val();
    var size = $("form#print-form .size input[type='radio']:checked").val();
    var mapText = {
        title: $('#export-title').val(),
        subtitle: $('#export-subtitle').val(),
        disclaimer: _this.options.disclaimer
    };
    var zoom = map.getZoom();
    var center = map.getCenter();
    var bearing = map.getBearing();

    _this.printCanvas(type, size, mapText, zoom, center, bearing);
}

PrintControl.prototype.printCanvas = function(type, size, mapText, zoom, center, bearing) {
    var _this = this;
    var dimensions = (size === 'default') ? [612, 792] : [792, 1224];

    if (type === 'png') {
        var mapCanvas = map.getCanvas();
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = _this.toPixels(dimensions[1]);
        tmpCanvas.height = _this.toPixels(dimensions[0]);

        var ctx = tmpCanvas.getContext('2d');
        ctx.drawImage(mapCanvas,0,0,mapCanvas.width,mapCanvas.height,0,0,tmpCanvas.width,tmpCanvas.height);

        tmpCanvas.toBlob(function(blob) {
            saveAs(blob, 'map.png');
        });
    } else {
        var pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: dimensions
        });

        if (size === 'default') {
          if (mapText.title !== '' && mapText.subtitle !== '' && mapText.disclaimer !== '') {
              pdf.addImage(_this.cropper.cropper('getCroppedCanvas').toDataURL('image/png'),
                  'png', 0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);

              var pad1 = 20;
              pdf.setFontSize(pad1 - 5);
              pdf.text(mapText.title, MARGINS, DEFAULT_HEIGHT + pad1);

              var pad2 = 16;
              pdf.setFontSize(pad2 - 2);
              pdf.text(mapText.subtitle, MARGINS, DEFAULT_HEIGHT + pad1 + pad2);

              var pad3 = 13;
              pdf.setFontSize(pad3 - 3);
              var lines = pdf.splitTextToSize(mapText.disclaimer, DEFAULT_WIDTH - (MARGINS * 2));
              pdf.text(MARGINS, DEFAULT_HEIGHT + pad1 + pad2 + pad3, lines);

          } else if (mapText.title !== '' && mapText.disclaimer !== '') {
              var height = DEFAULT_HEIGHT + 4;
              pdf.addImage(_this.cropper.cropper('getCroppedCanvas').toDataURL('image/png'),
                  'png', 0, 0, DEFAULT_WIDTH, height);

              var pad1 = 23;
              pdf.setFontSize(pad1 - 8);
              pdf.text(mapText.title, MARGINS, height + pad1);

              var pad2 = 18;
              pdf.setFontSize(pad2 - 8);
              var lines = pdf.splitTextToSize(mapText.disclaimer, DEFAULT_WIDTH - (MARGINS * 2));
              pdf.text(MARGINS, height + pad1 + pad2, lines);
          }

          pdf.save('map.pdf');
        } else {
            if (mapText.title !== '' && mapText.subtitle !== '' && mapText.disclaimer !== '') {
                pdf.addImage(_this.cropper.cropper('getCroppedCanvas').toDataURL('image/png'),
                    'png', 0, 0, LARGE_WIDTH, LARGE_HEIGHT);

                var pad1 = 26;
                pdf.setFontSize(pad1 - 5);
                pdf.text(mapText.title, MARGINS, LARGE_HEIGHT + pad1);

                var pad2 = 22;
                pdf.setFontSize(pad2 - 6);
                pdf.text(mapText.subtitle, MARGINS, LARGE_HEIGHT + pad1 + pad2);

                var pad3 = 19;
                pdf.setFontSize(pad3 - 6);
                var lines = pdf.splitTextToSize(mapText.disclaimer, LARGE_WIDTH - (MARGINS * 2));
                pdf.text(MARGINS, LARGE_HEIGHT + pad1 + pad2 + pad3, lines);

            } else if (mapText.title !== '' && mapText.disclaimer !== '') {
              var height = LARGE_HEIGHT + 4;
              pdf.addImage(_this.cropper.cropper('getCroppedCanvas').toDataURL('image/png'),
                  'png', 0, 0, LARGE_WIDTH, height);

              var pad1 = 29;
              pdf.setFontSize(pad1 - 8);
              pdf.text(mapText.title, MARGINS, height + pad1);

              var pad2 = 21;
              pdf.setFontSize(pad2 - 8);
              var lines = pdf.splitTextToSize(mapText.disclaimer, LARGE_WIDTH - (MARGINS * 2));
              pdf.text(MARGINS, height + pad1 + pad2, lines);
          }
            pdf.save('map.pdf');
        }
    }
}


