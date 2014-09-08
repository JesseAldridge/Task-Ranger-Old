
// Build an inverted index for fast #search.

function index_all() {
  index_nodes(get('top_level_ids'))
}

function stemmed_words(s) {
  var words = split_words(s)
  var swords = []
  for(var i = 0; i < words.length; i++)
    swords.push(stemmer(words[i]))
  return swords
}

function split_words(s) {
  var non_word_regex = /[0-9\W_]+/
  var words = s.split(non_word_regex)
  var lower_words = []
  for(var i = 0; i < words.length; i++)
    if(words[i])
      lower_words.push(words[i].toLowerCase())
  return lower_words
}

function index_nodes(node_ids) {
  for(var inode = 0; inode < node_ids.length; inode++) {
    var model = get_model(node_ids[inode])
    index_nodes(model.get('child_ids'))
    var swords = stemmed_words(model.get('text'))
    for(var iword = 0; iword < swords.length; iword++) {
      var stemmed_word = stemmer(swords[iword])
      var id_list = get('search_index.' + stemmed_word)
      if(!id_list)
        id_list = []
      id_list.push(node_ids[inode])
      set('search_index.' + stemmed_word, id_list)
    }
  }
}

function search(word) {
  return get('search_index.' + stemmer(word.toLowerCase()))
}