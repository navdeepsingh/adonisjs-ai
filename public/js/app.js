/*jshint esversion: 6 */
// register modal component
Vue.component('modal', {
   template: '#bs-modal'
});

new Vue({
  el: '#app',

  data: {
    statusLinking : 'Yet to Link',
    statusPulling : 'Yet to Pull',
    statusAnalyzing : 'Yet to Start',
    connectedTwitter : false,
    connectedFacebook : false,
    pulledTwitter : false,
    pulledFacebook : false,
    completeAnalyzing : false,
    showStep2 : false,
    showStep3 : false,
    showResultsLink : true,
    showModal: false,
    dataAnalyzing : ''
  },

  methods: {
    linkTwitter: function () {
      this.statusLinking = 'Loading..'
      this.$http.get('/api/connect/twitter').then((response) => {
        // success callback
        this.statusLinking = 'Redirecting..'
        window.location = response.body
      }, (response) => {
        // error callback
        this.statusLinking = 'Error'
      });
    },

    pullFeedTwitter: function () {
      this.statusPulling = 'Loading..'
      this.$http.get('/api/feed/twitter').then((response) => {
        // success callback
        console.log(response.body)
        this.statusPulling = 'Pulled'
        this.fetchStatus()
      }, (response) => {
        // error callback
        this.statusPulling = 'Error'
      });
    },

    linkFacebook: function () {
      this.statusLinking = 'Loading..'
      var that = this

      FB.getLoginStatus(function(response) {
        console.log(response.status)
        if ( response.status === 'connected' ) {

          var uid = response.authResponse.userID;
          var accessToken = response.authResponse.accessToken;
          that.connectedFacebook = true
          that.statusLinking = ''

          FB.api('/me', {fields: 'name'}, function(response) {
            console.log(response);
            that.$http.post('/api/store/facebook', {
              accessToken :accessToken,
              id : uid,
              name : response.name
            }).then((data, status, request) => {
                document.getElementById('facebookFeed').innerHTML = JSON.stringify(data.body)
        		that.fetchStatus()
            }, (response) => {
              this.statusPulling = 'Error'
            });
          });

        } else {

          // the user isn't logged in to Facebook.
          FB.login( function(response) {
            if ( response.authResponse ) {
              that.statusLinking = 'Fetching your information..'

              FB.api('/me', function(response) {
                console.log('Good to see you, ' + response.name + '.');
                that.statusLinking = 'Good to see you, ' + response.name + '.'
                that.connectedFacebook = true
                var accessToken = response.authResponse.accessToken;
                console.log(accessToken)
              });

            } else {
              that.statusLinking = 'User cancelled login or did not fully authorize.'
            }
          }, { scope: 'user_posts'});

        }
      });

    },

    pullFeedFacebook: function () {
      var that = this
      FB.getLoginStatus(function(response) {
        console.log(response.status)
        if ( response.status === 'connected' ) {

          var accessToken = response.authResponse.accessToken;

          FB.api('/me/feed', {access_token : accessToken}, function(response) {
            if (!response || response.error) {
              console.log(response.error)
            } else {
              console.log(response.data)
              that.$http.post('/api/feed/facebook', {
  			    data : response.data
  		      }).then((data, status, request) => {
			    that.fetchStatus()
		      }, (response) => {

		      })
            }
          });

        }
      })

    },

    startAnalyzing: function() {
        console.log('Start API here')
        this.statusAnalyzing = 'Analyzing..'
        this.$http.get('/analyze').then((response) => {
            const result = response.body
            this.completeAnalyzing = true
            this.statusAnalyzing = ''
        }).catch((error) => {
            this.statusAnalyzing = `Error : ${error}`
            console.log(error)
        });
    },

    fetchStatus: function () {
      this.$http.get('/fetch/status')
        .then((response) => {
          console.log(response.body)
          this.connectedTwitter = response.body.connectedTwitter
          this.connectedFacebook = response.body.connectedFacebook
          this.pulledTwitter = response.body.pulledTwitter
          this.pulledFacebook = response.body.pulledFacebook
          this.completeAnalyzing = response.body.completeAnalyzing
    	  if ( this.connectedTwitter === true && this.connectedFacebook === true ) {
        	this.showStep2 = true
            this.statusLinking = ''
    	  }
          if ( this.pulledTwitter === true && this.pulledFacebook === true ) {
            this.showStep3 = true
            this.statusPulling = ''
          }
          if ( this.completeAnalyzing == true ) {
            this.statusAnalyzing = ''
          }
        })
        .catch((error) => {
          console.log(error)
        });
    }
  },

  mounted : function() {
    this.fetchStatus()
    that = this

    Chart.defaults.global.pointHitDetectionRadius = 1;

    var customTooltips = function(tooltip) {
      // Tooltip Element
      var tooltipEl = document.getElementById('chartjs-tooltip');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = "<table></table>"
        document.body.appendChild(tooltipEl);
      }
      // Hide if no tooltip
      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
      }
      // Set caret Position
      tooltipEl.classList.remove('above', 'below', 'no-transform');
      if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
      } else {
        tooltipEl.classList.add('no-transform');
      }
      function getBody(bodyItem) {
        return bodyItem.lines;
      }

      // Set Text
      if (tooltip.body) 
      {
          console.log(tooltip.body)
        var titleLines = tooltip.title || [];
        var bodyLines = tooltip.body.map(getBody);
        var innerHtml = '<thead>';
        titleLines.forEach(function(title) {
          innerHtml += '<tr><th>' + title + ' - test</th></tr>';
        });
        innerHtml += '</thead><tbody>';
        bodyLines.forEach(function(body, i) {
          var colors = tooltip.labelColors[i];
          var style = 'background:' + colors.backgroundColor;
          style += '; border-color:' + colors.borderColor;
          style += '; border-width: 2px';
          var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
          innerHtml += '<tr><td>' + span + body + '</td></tr>';
        });
        innerHtml += '</tbody>';
        var tableRoot = tooltipEl.querySelector('table');
        tableRoot.innerHTML = innerHtml;
      }
      var position = this._chart.canvas.getBoundingClientRect();
      // Display, position, and set styles for font
      tooltipEl.style.opacity = 1;
      tooltipEl.style.left = position.left + tooltip.caretX + 'px';
      tooltipEl.style.top = position.top + tooltip.caretY + 'px';
      tooltipEl.style.fontFamily = tooltip._fontFamily;
      tooltipEl.style.fontSize = tooltip.fontSize;
      tooltipEl.style.fontStyle = tooltip._fontStyle;
      tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
    }


    $('#myModal').on('shown.bs.modal',function(event){
       var modal = $(this);
       var canvas = modal.find('.modal-body canvas');
       let analysisData = []
       let labelsData = []
       let negativeData = []
       let positiveData = []
       let tooltipTwNvData = []
       let tooltipTwPvData = []
       let tooltipFbNvData = []
       let tooltipFbPvData = []
        let socialResults, ctx, labelNegative, labelPositive, labelChart

       that.$http.get('/results').then((response) => {
           const results = response.body
           console.log(JSON.stringify(results, undefined, 2))
           that.dataAnalyzing = results
           for(let social in results) {
            if ( social == 'twitter' ) {
                socialResults = results.twitter
                ctx = canvas[0].getContext("2d")
                labelNegative = 'Negative Tweets'
                labelPositive = 'Positive Tweets'
                labelChart = 'Twitter Sentiment'
            } else if (social == 'facebook') {
                socialResults = results.facebook
                ctx = canvas[1].getContext("2d")
                labelNegative = 'Negative Posts'
                labelPositive = 'Positive Posts'
                labelChart = 'Facebook Sentiment'              
            }

            let index = 1

            for (let feed in socialResults) {
                let analysis = JSON.parse(socialResults[feed].analysis)
                if (analysis != null) {

                    if (analysis.score < 0) {
                        negativeData.push(analysis.score)
                    } else if (analysis.score > 0) {
                        positiveData.push(analysis.score)
                    }

                    labelsData.push(index)
                    if ( social == 'twitter' ) {
                        if (analysis.score < 0){
                            tooltipTwNvData.push(socialResults[feed].feed)   
                        } else if ( analysis.score > 0) {
                            tooltipTwPvData.push(socialResults[feed].feed)
                        }                       
                    } else {
                        if (analysis.score < 0){
                            tooltipFbNvData.push(socialResults[feed].feed)   
                        } else if ( analysis.score > 0) {
                            tooltipFbPvData.push(socialResults[feed].feed)
                        }                           
                    }
                    index++
                }
            }

           labelsData = labelsData.slice(0, Math.max(positiveData.length, negativeData.length) )

           var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsData,
                datasets: [{
                 label: labelNegative,
                 data: negativeData,
                 backgroundColor: "rgba(31,119,190,1)"
               }, {
                 label: labelPositive,
                 data : positiveData,
                 backgroundColor: "rgba(44,160,44,1)"
               }]
            },
            options: {
                 scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                 },
                 title: {
                    display: true,
                    text: labelChart
                 },
                 tooltips : {
                     enabled: true,
                     mode : 'single',
                      callbacks: {
                          title: function (tooltipItem, data) { 
                              var indice = tooltipItem[0].index
                              var yLabel = tooltipItem[0].yLabel
                              if (social == 'twitter') {
                                if (yLabel < 0)
                                  return tooltipTwNvData[indice]
                                else if (yLabel > 0)
                                  return tooltipTwPvData[indice]                
                              } else {
                                if (yLabel < 0)
                                  return tooltipFbNvData[indice]
                                else if (yLabel > 0)
                                  return tooltipFbPvData[indice]                                                 
                              }
                          }
                      }                     
                 },
                 animation:{
                     animateScale:true
                 }
            }
         })
         negativeData = []
         positiveData = []
         labelsData = []
         tooltipData = []
         }
       }).catch((error) => {
            this.statusAnalyzing = `Error : ${error}`
            console.log(error)
       });

    })
  },

  created: function() {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '212924785417190',
        xfbml      : true,
        version    : 'v2.7'
      });
   };

    (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }
})
