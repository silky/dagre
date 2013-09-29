var nodesFromList = require("graphlib").filter.nodesFromList;

module.exports = initLayerGraphs;

/*
 * This function takes a compound layered graph, g, and produces an array of
 * layer graphs. Each entry in the array represents a subgraph of nodes
 * relevant for performing crossing reduction on that layer.
 */
function initLayerGraphs(g) {
  var ranks = [];

  function dfs(u) {
    if (u === null) {
      g.children(u).forEach(function(v) { dfs(v); });
      return;
    }

    var value = g.node(u);
    value.minRank = ("rank" in value) ? value.rank : Number.MAX_VALUE;
    value.maxRank = ("rank" in value) ? value.rank : Number.MIN_VALUE;
    g.children(u).forEach(function(v) {
      dfs(v);
      value.minRank = Math.min(value.minRank, g.node(v).minRank);
      value.maxRank = Math.max(value.maxRank, g.node(v).maxRank);
    });

    for (var i = value.minRank; i <= value.maxRank; ++i) {
      if (!(i in ranks)) ranks[i] = [];
      ranks[i].push(u);
    }
  }
  dfs(null);

  var layerGraphs = [];
  ranks.forEach(function(us, rank) {
    layerGraphs[rank] = g.filterNodes(nodesFromList(us));
  });

  return layerGraphs;
}