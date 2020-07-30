import moment from "moment";
import 'moment/min/locales';
const Chart = require("chart");

Chart.elements.Rectangle.prototype.draw = function () {
  var ctx = this._chart.ctx;
  var vm = this._view;
  var left, right, top, bottom, signX, signY, borderSkipped, radius;
  var borderWidth = vm.borderWidth;
  // Set Radius Here
  // If radius is large enough to cause drawing errors a max radius is imposed
  var cornerRadius = 6;

  if (!vm.horizontal) {
    // bar
    left = vm.x - vm.width / 2;
    right = vm.x + vm.width / 2;
    top = vm.y;
    bottom = vm.base;
    signX = 1;
    signY = bottom > top ? 1 : -1;
    borderSkipped = vm.borderSkipped || "bottom";
  } else {
    // horizontal bar
    left = vm.base;
    right = vm.x;
    top = vm.y - vm.height / 2;
    bottom = vm.y + vm.height / 2;
    signX = right > left ? 1 : -1;
    signY = 1;
    borderSkipped = vm.borderSkipped || "left";
  }

  // Canvas doesn't allow us to stroke inside the width so we can
  // adjust the sizes to fit if we're setting a stroke on the line
  if (borderWidth) {
    // borderWidth shold be less than bar width and bar height.
    var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
    borderWidth = borderWidth > barSize ? barSize : borderWidth;
    var halfStroke = borderWidth / 2;
    // Adjust borderWidth when bar top position is near vm.base(zero).
    var borderLeft = left + (borderSkipped !== "left" ? halfStroke * signX : 0);
    var borderRight =
      right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
    var borderTop = top + (borderSkipped !== "top" ? halfStroke * signY : 0);
    var borderBottom =
      bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);
    // not become a vertical line?
    if (borderLeft !== borderRight) {
      top = borderTop;
      bottom = borderBottom;
    }
    // not become a horizontal line?
    if (borderTop !== borderBottom) {
      left = borderLeft;
      right = borderRight;
    }
  }

  ctx.beginPath();
  ctx.fillStyle = vm.backgroundColor;
  ctx.strokeStyle = vm.borderColor;
  ctx.lineWidth = borderWidth;

  // Corner points, from bottom-left to bottom-right clockwise
  // | 1 2 |
  // | 0 3 |
  var corners = [[left, bottom], [left, top], [right, top], [right, bottom]];

  // Find first (starting) corner with fallback to 'bottom'
  var borders = ["bottom", "left", "top", "right"];
  var startCorner = borders.indexOf(borderSkipped, 0);
  if (startCorner === -1) {
    startCorner = 0;
  }

  function cornerAt(index) {
    return corners[(startCorner + index) % 4];
  }

  // Draw rectangle from 'startCorner'
  var corner = cornerAt(0);
  ctx.moveTo(corner[0], corner[1]);

  for (var i = 1; i < 4; i++) {
    corner = cornerAt(i);
    let nextCornerId = i + 1;
    if (nextCornerId === 4) {
      nextCornerId = 0;
    }

    // let nextCorner = cornerAt(nextCornerId);

    let width = corners[2][0] - corners[1][0];
    let height = corners[0][1] - corners[1][1];
    let x = corners[1][0];
    let y = corners[1][1];
    // eslint-disable-next-line
    var radius = cornerRadius;

    // Fix radius being too large
    if (radius > height / 2) {
      radius = height / 2;
    }
    if (radius > width / 2) {
      radius = width / 2;
    }

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  ctx.fill();
  if (borderWidth) {
    ctx.stroke();
  }
};

var mode = "light"; //(themeMode) ? themeMode : 'light';
var fonts = {
  base: "Open Sans"
};

// Colors
var colors = {
  gray: {
    100: "#f6f9fc",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#8898aa",
    700: "#525f7f",
    800: "#32325d",
    900: "#212529"
  },
  theme: {
    default: "#172b4d",
    primary: "#5e72e4",
    secondary: "#f4f5f7",
    info: "#11cdef",
    success: "#2dce89",
    danger: "#f5365c",
    warning: "#fb6340"
  },
  black: "#12263F",
  white: "#FFFFFF",
  transparent: "transparent"
};

// Methods

// Chart.js global options
function chartOptions() {
  // Options
  var options = {
    defaults: {
      global: {
        responsive: true,
        maintainAspectRatio: false,
        defaultColor: mode === "dark" ? colors.gray[700] : colors.gray[600],
        defaultFontColor: mode === "dark" ? colors.gray[700] : colors.gray[600],
        defaultFontFamily: fonts.base,
        defaultFontSize: 13,
        layout: {
          padding: 0
        },
        legend: {
          display: false,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16
          }
        },
        elements: {
          point: {
            radius: 0,
            backgroundColor: colors.theme["primary"]
          },
          line: {
            tension: 0.4,
            borderWidth: 4,
            borderColor: colors.theme["primary"],
            backgroundColor: colors.transparent,
            borderCapStyle: "rounded"
          },
          rectangle: {
            backgroundColor: colors.theme["warning"]
          },
          arc: {
            backgroundColor: colors.theme["primary"],
            borderColor: mode === "dark" ? colors.gray[800] : colors.white,
            borderWidth: 4
          }
        },
        tooltips: {
          enabled: true,
          mode: "index",
          intersect: false
        }
      },
      doughnut: {
        cutoutPercentage: 83,
        legendCallback: function (chart) {
          var data = chart.data;
          var content = "";

          data.labels.forEach(function (label, index) {
            var bgColor = data.datasets[0].backgroundColor[index];

            content += '<span class="chart-legend-item">';
            content +=
              '<i class="chart-legend-indicator" style="background-color: ' + bgColor + '"></i>';


            content += label;
            content += "</span>";
          });

          return content;
        }
      }
    }
  };

  // yAxes
  Chart.scaleService.updateScaleDefaults("linear", {
    gridLines: {
      borderDash: [2],
      borderDashOffset: [2],
      color: mode === "dark" ? colors.gray[900] : colors.gray[300],
      drawBorder: false,
      drawTicks: false,
      lineWidth: 0,
      zeroLineWidth: 0,
      zeroLineColor: mode === "dark" ? colors.gray[900] : colors.gray[300],
      zeroLineBorderDash: [2],
      zeroLineBorderDashOffset: [2]
    },
    ticks: {
      beginAtZero: true,
      padding: 10,
      callback: function (value) {
        if (!(value % 10)) {
          return value;
        }
      }
    }
  });

  // xAxes
  Chart.scaleService.updateScaleDefaults("category", {
    gridLines: {
      drawBorder: false,
      drawOnChartArea: false,
      drawTicks: false
    },
    ticks: {
      padding: 20
    }
  });

  return options;
}

// Parse global options
function parseOptions(parent, options) {
  for (var item in options) {
    if (typeof options[item] !== "object") {
      parent[item] = options[item];
    } else {
      parseOptions(parent[item], options[item]);
    }
  }
}






/*!
  =========================================================
    =========================================================
      =========================================================
  =========================================================
=========================================================
=========================================================
  =========================================================
    =========================================================
      =========================================================
        =========================================================
*/

const buildChar1 = function (userData, users, prospects) {
  moment.locale('es');

  let init = moment(userData.create_at, "UNIX").subtract(1, 'months').unix();

  if (moment(init, "UNIX").add(6, 'months').unix() < moment().unix()) {
    init = moment().subtract(7, 'months').unix();
  }

  let labels = [];
  let values1 = [0];
  let values2 = [0];

  for (var i = 0; i < 6; i++) {
    labels[i] = moment(init, "UNIX").add(i+ 1, 'months').format("MMM");

    let numUsers = null;
    let numProspects = null;
    let start = moment(init, "UNIX").add(i, 'months').unix();
    let end = moment(init, "UNIX").add(i + 1, 'months').unix();

    numUsers = users.filter(user => {
      return user.create_at > start && user.create_at < end;
    }).length;
    numProspects = prospects.filter(prospect => {
      return prospect.create_at > start && prospect.create_at < end;
    }).length;

    if (numUsers !== 0)
      values1[i] = numUsers;
    if (numProspects !== 0)
      values2[i] = numProspects;
  }

  return {
    options: {
      scales: {
        yAxes: [
          {
            gridLines: {
              color: colors.gray[900],
              zeroLineColor: colors.gray[900]
            },
            ticks: {
              callback: function (value) {
                if (!(value % 1)) {
                  return value + "p.";
                }
              }
            }
          }
        ]
      },
      tooltips: {
        callbacks: {
          label: function (item, data) {
            var label = data.datasets[item.datasetIndex].label || "";
            var yLabel = item.yLabel;
            var content = "";

            if (data.datasets.length > 1) {
              content += label;
            }

            content += yLabel + " personas";
            return content;
          }
        }
      }
    },
    data1: canvas => {
      return {
        labels,
        datasets: [
          {
            label: "Performance",
            data: values1
          }
        ]
      };
    },
    data2: canvas => {
      return {
        labels,
        datasets: [
          {
            label: "Performance",
            data: values2
          }
        ]
      };
    }
  }
}


/*!
=========================================================
* metodo render :D
=========================================================
*/

const buildChar2 = function (userData, _users) {
  moment.locale('es');

  let init = userData.create_at;
  let users = _users.filter(user => { return user.products !== null })//filtramos prospectos

  if (moment(init, "UNIX").add(6, 'months').unix() < moment().unix()) {
    init = moment().subtract(6, 'months').unix();
  }

  let labels = [];
  let values = [];

  for (var i = 0; i < 6; i++) {
    labels[i] = moment(init, "UNIX").add(i, 'months').format("MMM");

    let revenue = null;
    let start = moment(init, "UNIX").add(i, 'months').unix();
    let end = moment(init, "UNIX").add(i + 1, 'months').unix();

    users.forEach(user => {
      let products = JSON.parse(user.products || "[]").filter(product => {
        return product.t > start && product.t < end;
      });
      products.forEach(product => {
        revenue = revenue + product.p;
      });
    });
    values[i] = revenue;
  }

  return {
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (value) {
                if (!(value % 10)) {
                  //return '$' + value + 'k'
                  return value;
                }
              }
            }
          }
        ]
      },
      tooltips: {
        callbacks: {
          label: function (item, data) {
            var label = data.datasets[item.datasetIndex].label || "";
            var yLabel = item.yLabel;
            var content = "";
            if (data.datasets.length > 1) {
              content += label;
            }
            content += "$ " + yLabel;
            return content;
          }
        }
      }
    },
    data: {
      labels,
      datasets: [
        {
          label: "Sales",
          data: values,
          maxBarThickness: 10
        }
      ]
    }
  }
}


export {
  buildChar2,
  buildChar1,
  chartOptions, // used inside src/views/Index.js
  parseOptions, // used inside src/views/Index.js
};