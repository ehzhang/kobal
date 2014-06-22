function annotations() {

  var $annotationPane = $createAnnotationPane();

  /**
   * Handler for annotation clicks!
   * @param eventData
   */
  function openAnnotationPane(eventData){
    var annotationId = eventData.target.getAttribute('annotation-id');

    var paneWidth = $annotationPane.width();

    if (!$annotationPane.is(':animated')) {
      $annotationPane.animate({"margin-right": '+=' + paneWidth});
    }

    populateAnnotations(annotationId);

    $('#comment-submit').click(function(){
      postComment(annotationId);
    });

  }

  function postComment(id) {
    var $input = $('#comment-input'),
        comment = $input.val(),
        content = $findByAttributeValue('paragraph-id', id).val();

    chrome.runtime.sendMessage({
      url: location.href,
      id: id,
      comment: comment,
      content: content,
      type: "POST"
    }, function (response) {
      debugger;
    });
  }

  /**
   * Close the Annotation Pane
   */
  function closeAnnotationPane(){
    var paneWidth = $annotationPane.width();
    if ($annotationPane.css("margin-right").split('px')[0] >= -5 && !$annotationPane.is(':animated')) {
      $annotationPane.animate({"margin-right": '-=' + paneWidth});
    }
  }

  function clearAnnotationPane(){
    $annotationPane.find('.comments').empty();
  }

  /**
   * Attach an annotation to a paragraph tag.
   * @param paragraph
   * @param id
   */
  function attachAnnotation(paragraph, id){

    var margin = 16,
        offsetLeft= paragraph.offsetLeft + paragraph.offsetWidth + margin,
        offsetTop= paragraph.offsetTop,
        $paragraph = $(paragraph).attr('paragraph-id', id),
        $annotation = $createAnnotation(0, offsetLeft, offsetTop, id);

    $annotation.click(openAnnotationPane);

    // Append the annotation to the body
    $('body').append($annotation);

    // When the paragraph gets hovered, make the annotation tag visible.
    $paragraph.hover(function(){
      $annotation.css('visibility', 'visible');
    }, function() {
      // Nothing on hover leave right now...
    });
  }

  /**
   * Create a jQuery object annotation tag based on a number
   * @param num
   * @param offsetLeft
   * @param offsetTop
   * @param id
   */
  function $createAnnotation(num, offsetLeft, offsetTop, id) {

    var n = num === 0 ? "" : num,
        nocount = num === 0 ? 'nocount' : '';

    return $(
      "<span class='annotation "+ nocount + "'>" +
      n +
      "</span>"
    ).css({
        left: offsetLeft,
        top: offsetTop
      }
    ).attr('annotation-id', id);
  }

  /**
   * Create the annotation Pane
   */
  function $createAnnotationPane() {
    return $("" +
      "<div id='annotation-pane'>" +
        "<div class='container'>" +
          "<ul class='comments'>" +
          "" +
          "</ul>" +
          "<form>" +
            "<textarea type='comment' id='comment-input'></textarea>" +
            "<br>" +
            "<button id='comment-submit'> POST COMMENT </button>" +
          "</form>" +
        "</div>" +
      "</div>"
    )
  }

  /**
   * Populate the annotations panel based on the data-id
   */
  function populateAnnotations(id) {

    clearAnnotationPane();

    appendComment("Loading...");
    console.log("opening id: " + id);

    // Get data from firebase using the id

    var $paragraph = $findByAttributeValue("paragraph-id", id),
        url = location.href,
        content = $paragraph.text();


    // Send a message to chrome
    chrome.runtime.sendMessage({

      url: url,
      id: id,
      content: content,
      type: "GET"

    },function (response) {

      clearAnnotationPane();

      if (response.length > 0){

        debugger;

      } else {

        appendComment("No Comments Yet!");

      }
    });
  }

  /**
   * Given a comment, append the comment to the comments container.
   * @param comment
   */
  function appendComment(comment){
    $annotationPane.find('.comments')
      .append("" +
        "" + comment +
        "" +
        "")
  }

  /**
   * Helper function to find jQuery object by attribute and value
   * @param attr
   * @param val
   */
  function $findByAttributeValue(attr, val){
    return $("[" + attr + "='" + val + "']");
  }

  /**
   * Set up the page with annotations.
   */
  function setup() {

    // Add the annotation pane to the body
    $('body').append($annotationPane);

    // Prepare the annotation pane to listen for closing/opening
    $(document).click(function(e){
      if (e.target.id !="annotation-pane" && $(e.target).parents('#annotation-pane').length == 0) {
        closeAnnotationPane();
      }
    });

    // Find each paragraph tag
    $('p').each(function(id) {
      attachAnnotation(this, id);
    })
    // For debugging paragraphs
    .hover(function(){
      $(this).css("background", "yellow");
    }, function () {
      $(this).css("background", "none");
    });

  }

  function exec() {

    // Set up the page annotations
    setup();

  }

  exec();
}


chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      annotations();

    }
  }, 10);
});