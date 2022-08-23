import $ from 'jquery';

import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';

import CodeMirror from './codeMirrorLoader';


const autoFold = (doc) => {
  doc.execCommand('foldAll');
  doc.foldCode(CodeMirror.Pos(0, 0), 1);
}

const doc = CodeMirror.fromTextArea(document.getElementById('document'), {
  mode: {
    name: 'javascript',
    json: true,
  },
  indentUnit: 4,
  lineNumbers: true,
  autoClearEmptyLines: true,
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  matchBrackets: true,
  readOnly: ME_SETTINGS.readOnly,
  noDelete: ME_SETTINGS.noDelete,
  theme: ME_SETTINGS.codeMirrorEditorTheme,
  extraKeys: {
    'Ctrl-[': cm => autoFold(cm),
    'Ctrl-]': cm => CodeMirror.commands.unfoldAll(cm),
  },
});

autoFold(doc);

window.onBackClick = function () {
  // "Back" button is clicked

  if (doc.isClean()) {
    window.history.back();
  } else if ($('#discardChanges').length === 0) {
    $('#pageTitle').parent().append(
      '<div id="discardChanges" class="alert alert-warning"><strong>Document has changed! Are you sure you wish to go back?</strong></div>',
    );
    $('.backButton').text('Back & Discard Changes');
  } else {
    window.history.back();
  }

  return false;
};

window.onSubmitClick = function () {
  // Save button is clicked
  $('#discardChanges').remove();

  $.ajax({
    type: 'POST',
    url: `${ME_SETTINGS.baseHref}checkValid`,
    data: {
      document: doc.getValue(),
    },
  }).done((data) => {
    if (data === 'Valid') {
      $('#documentInvalidJSON').remove();
      $('#documentEditForm').submit();
    } else if ($('#documentInvalidJSON').length === 0) {
      $('#pageTitle').parent().append('<div id="documentInvalidJSON" class="alert alert-danger"><strong>Invalid JSON</strong></div>');
    }
  });
  return false;
};

$(() => {
  $('.deleteButtonDocument').on('click', function (e) {
    const $form = $(this).closest('form');
    e.stopPropagation();
    e.preventDefault();

    if (ME_SETTINGS.confirmDelete) {
      $('#confirm-document-delete').modal({ backdrop: 'static', keyboard: false }).one('click', '#delete', function () {
        $form.trigger('submit'); // submit the form
      });
    } else {
      $form.trigger('submit');
    }
  });
});
