M.gradingform_rubric = {};

/**
 * This function is called for each rubric on page.
 */
M.gradingform_rubric.init = function(Y, options) {
    Y.on('click', M.gradingform_rubric.levelclick, '#rubric-' + options.name + ' .level', null, Y, options.name);
    // Capture also space and enter keypress.
    Y.on('key', M.gradingform_rubric.levelclick, '#rubric-' + options.name + ' .level', 'space', Y, options.name);
    Y.on('key', M.gradingform_rubric.levelclick, '#rubric-' + options.name + ' .level', 'enter', Y, options.name);
    // Capture leaving a the remark fields
    Y.on('blur', M.gradingform_rubric.storeGradingPanel, '#rubric-' + options.name + ' .remark textarea', null, Y, options.name)

    Y.all('#rubric-'+options.name+' .radio').setStyle('display', 'none')
    Y.all('#rubric-'+options.name+' .level').each(function (node) {
      if (node.one('input[type=radio]').get('checked')) {
        node.addClass('checked');
      }
    });
};

M.gradingform_rubric.levelclick = function(e, Y, name) {
    var el = e.target
    while (el && !el.hasClass('level')) el = el.get('parentNode')
    if (!el) return
    e.preventDefault();
    el.siblings().removeClass('checked');

    // Set aria-checked attribute for siblings to false.
    el.siblings().setAttribute('aria-checked', 'false');
    chb = el.one('input[type=radio]')
    if (!chb.get('checked')) {
        chb.set('checked', true)
        el.addClass('checked')
        // Set aria-checked attribute to true if checked.
        el.setAttribute('aria-checked', 'true');
    } else {
        el.removeClass('checked');
        // Set aria-checked attribute to false if unchecked.
        el.setAttribute('aria-checked', 'false');
        el.get('parentNode').all('input[type=radio]').set('checked', false)
    }

    M.gradingform_rubric.storeGradingPanel(e, Y, name);
}

M.gradingform_rubric.storeGradingPanel = function(e, Y, name) {
    require(['core/ajax', 'core/notification'], function(ajax, notification) { 
        // This is being a little lazy, I didn't hunt down the best source for these values
        assignmentid = Y.all('div[data-region="user-info"]').item(0).getAttribute('data-assignmentid');
        userid = Y.all('div[data-region="user-info"]').item(0).getAttribute('data-userid');
        data = $('form.gradeform').serialize();

        ajax.call([{
            methodname: 'mod_assign_submit_grading_form',
            args: {assignmentid: assignmentid, userid: userid, jsonformdata: JSON.stringify(data)},
            done: function(response) {
                el = e.target;
                while (el && !(el.hasClass('levels') || el.hasClass('remark'))) el = el.get('parentNode');
                if (!el) return;
                description = el.siblings('.description').item(0);
                saveIndicator = description.all('span.save-indicator');
                if (saveIndicator.size() == 0) {
                    description.appendChild('<span class="save-indicator fa" ></span>');
                    saveIndicator = description.all('span.save-indicator').item(0);
                }
                if (response.length > 0) {
                    saveIndicator.replaceClass('fa-check-circle notifysuccess', 'fa-exclamation-circle notifyproblem');
                }
                else {
                    saveIndicator.replaceClass('fa-exclamation-circle notifyproblem', 'fa-check-circle notifysuccess');
                    // might actually want to retrieve the data and compare it on success to make sure things have not unexpectedly changed
                    M.core_formchangechecker.set_form_submitted();
                }
            }, 
            fail: notification.exception
        }]);
    });
}
