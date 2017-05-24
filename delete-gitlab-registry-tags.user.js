// ==UserScript==
// @name         Delete GitLab Registry Tags
// @namespace    https://github.com/johanbrandhorst/delete-gitlab-registry-tags
// @version      0.1
// @description  Delete tags on a GitLab registry page by regular expression
// @author       Johan Brandhorst
// @match        https://*.githost.io/*/container_registry
// @match        https://gitlab.com/*/container_registry
// @grant        none
// ==/UserScript==
//
// Script based on script suggested by Andrey Lukashin (https://gitlab.com/loukash)
// in https://gitlab.com/gitlab-org/gitlab-ce/issues/21608#note_30431324
// and StackOverflow answer
// http://stackoverflow.com/questions/6480082/add-a-javascript-button-using-greasemonkey-or-tampermonkey
//
// Warning:
// Depends on GitLab supplying jQuery.

/*jshint multistr: true */

(function() {
    'use strict';

    var form = document.createElement ('form');
    form.setAttribute ('class', 'form-inline hidden-xs pull-right');
    form.innerHTML = '\
<div class="form-group">\
    <input type="text" class="form-control" id="tag-regex" placeholder="Regex tag">\
</div>\
<div class="form-group">\
    <div class="checkbox">\
        <label>\
            <input type="checkbox"  id="dry-run" checked>Dry Run\
        </label>\
    </div>\
</div>\
<button id="delete-button" class="btn btn-remove" type="button">Delete matching tags</button>';

    // Get element we want to insert the form into
    var header = document.getElementsByClassName ("container-image-head")[0];
    header.appendChild(form);

    //--- Activate button.
    document.getElementById ("delete-button").addEventListener(
        "click", DeleteTag, false
    );

    function DeleteTag (zEvent) {
        try {
            var regex = RegExp(document.getElementById ("tag-regex").value);
        } catch(e) {
            window.alert(e);
            return;
        }
        $('.content-list table tbody tr').each(function(){
            var url = $(this).find('td.content a').attr('href');
            var tag = url.split("/").pop();
            if (regex.test(tag)) {
                if (document.getElementById('dry-run').checked) {
                    console.log("Would've deleted: " + tag);
                } else {
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: {_method:'delete', authenticity_token:$('meta[name="csrf-token"]').attr("content")},
                        success: function(data){
                            console.log(tag + ' deleted');
                        },
                        async: true
                    });
                }
            }
        });
    }
})();
