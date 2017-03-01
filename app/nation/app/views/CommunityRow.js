$(function() {

    App.Views.CommunityRow = Backbone.View.extend({

        tagName: "tr",

        events: {
            "click .destroy": function(e) {
                var loginOfMem = $.cookie('Member.login');
                var lang = App.Router.getLanguage(loginOfMem);
                var languageDictValue=App.Router.loadLanguageDocs(lang);
                if (confirm(languageDictValue.attributes.Confirm_Community)) {
                    e.preventDefault()
                    this.model.destroy()
                    this.remove()
                } else {
                    e.preventDefault()

                    App.startActivityIndicator();
                    Backbone.history.navigate('listCommunity', {
                        trigger: true
                    });
                    App.stopActivityIndicator();
                }
            },
            "click .browse": function(e) {
                e.preventDefault()
                $('#modal').modal({
                    show: true
                })
            }
        },

        //template : $("#template-GroupRow").html(),

        initialize: function() {

        },

        render: function() {
            var that = this;
            var community = this.model;
            var communityData = '';
            var communityCode = community.attributes.Code;
            var communityName = community.get('Name'); //#80:Add Report button ( Generate Report ) on the Communities page at nation
            var communityDate = community.get('lastActivitiesSyncDate'); //#50:Add Last Activities Sync Date to Activity Report On Nation For Individual Communities
            var communitySyncdate = communityDate.split("/").join("-");
            communityData = communityCode + "." + communityName;
            var temp = $.url().data.attr.host.split(".")
            var nationName = temp[0];
            var nationUrl = $.url().data.attr.authority;
            if (this.options.startDate) {
                var startDt = this.options.startDate.split("-");
                var Year = startDt[0];
                var Mnth = parseInt(startDt[1]) - 1;
                var date = new Date(Year, Mnth, 01, 00, 00, 00);
            } else {
                var date = new Date();
                this.options.startDate = date.getFullYear() + '-' + date.getMonth();
            }
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            var startDate = that.changeDateFormat(that.turnDateToYYYYMMDDFormat(firstDay));
            var endDate = that.changeDateFormat(that.turnDateToYYYYMMDDFormat(lastDay));
            $.ajax({
                url: 'http://' + nationName + ':oleoleole@' + nationUrl + '/activitylog/_design/bell/_view/getDocByCommunityCodeWithValue?_include_docs=true&&startkey=["' + communityCode + '","' + startDate + '"]&endkey=["' +
                    communityCode + '","' + endDate + '"]',
                type: 'GET',
                dataType: 'jsonp',
                success: function(result) {
                    var memberVisits = 0;
                    var resourceViews = 0;
                    var activitylogModels;
                    activitylogModels = result.rows;
                    if (activitylogModels.length > 0) {
                        memberVisits = 0;
                        resourceViews = 0;
                        for (var i = 0; i < activitylogModels.length; i++) {
                            var femaleVisits = activitylogModels[i].value.female_visits;
                            var maleVisits = activitylogModels[i].value.male_visits;
                            memberVisits = memberVisits + femaleVisits + maleVisits;
                            var female_opened = activitylogModels[i].value.female_opened;
                            var male_opened = activitylogModels[i].value.male_opened;
                            var female_opened_count = 0;
                            var male_opened_count = 0;
                            for (var j = 0; j < female_opened.length; j++) {
                                female_opened_count = female_opened_count + female_opened[j];
                            }
                            for (var k = 0; k < male_opened.length; k++) {
                                male_opened_count = male_opened_count + male_opened[k];
                            }
                            resourceViews = resourceViews + female_opened_count + male_opened_count;
                        }
                    }
                    // //Issue#80:Add Report button ( Generate Report ) on the Communities page at nation
                    var row = "<td>" + community.get('Name') + "</td>" +
                        "<td>" + community.get('lastAppUpdateDate') + "</td>" +
                        "<td>" + community.get('version') + "</td>" +
                        "<td>" + community.get('lastPublicationsSyncDate') + "</td>" +
                        "<td>" + community.get('lastActivitiesSyncDate') + "</td>" +
                        "<td>" + memberVisits + "</td>" +
                        "<td>" + resourceViews + "</td>" +
                        "<td>" +
                        "<a  class='btn btn-success' id='submit' href='#communityreport/" + communitySyncdate + "/" + community.get("Name") + "/" + community.get('Code') + "/" + that.options.startDate + "'>" + App.languageDictValue.get("Generate_Report") + "</a>&nbsp&nbsp&nbsp";
                    if($.cookie('Member.login'))
                    {
                        row = row +
                            "<a role='button' class='btn btn-info' href='#addCommunity/" + community.get('_id') + "'> <i class='icon-pencil icon-white'></i>" + App.languageDictValue.get("EditLabel") + "</a>&nbsp&nbsp&nbsp" +
                            "<a role='button' class='btn btn-danger destroy' href='#addCommunity/" +
                            community.get('_id') + "'> <i class='icon-remove icon-white'></i>" + App.languageDictValue.get("DeleteLabel") + "</a>";
                    }
                    row = row + "</td>";
                    that.$el.append(row);
                },
                error: function() {
                    console.log("Unable to get communities list.");
                }
            });
        },
        turnDateToYYYYMMDDFormat: function(date) {
            // GET YYYY, MM AND DD FROM THE DATE OBJECT
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString();
            var dd = date.getDate().toString();
            // CONVERT mm AND dd INTO chars
            var mmChars = mm.split('');
            var ddChars = dd.split('');
            // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
            var dateString = yyyy + '/' + (mmChars.length === 2 ? mm : "0" + mmChars[0]) + '/' + (ddChars.length === 2 ? dd : "0" + ddChars[0]);
            return dateString;
        },
        changeDateFormat: function(date) {
            var datePart = date.match(/\d+/g),
                year = datePart[0],
                month = datePart[1],
                day = datePart[2];
            return year + '/' + month + '/' + day;
        }

    })

})