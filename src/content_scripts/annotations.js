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
            "<textarea type='comment' class='comment-input'></textarea>" +
            "<br>" +
            "<button class='comment-submit'> POST COMMENT </button>" +
          "</form>" +
        "</div>" +
      "</div>"
    )
  }

  function populateAnnotations(id) {

    clearAnnotationPane();

    // Get data from firebase using the id

    $annotationPane.find('.comments')
      .append('<li><h1>'+ id +'</h1></li>');


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

      // Send a message to chrome (Listen for on app.js)
      chrome.runtime.sendMessage({
        url: "blah.com",
        path: "//Body/Div whatever",
        content: "documentation blah blah bad"
      }, function (response) {

      console.log(response);

      });

      annotations();

    }
  }, 10);
});