const DataLoader = require('dataloader');
const axios = require('axios');

exports.loaders = () => {
  return {
    diceSeedLoader: new DataLoader(async ids =>
      Promise.all(
        ids.map(seedId =>
          axios.post(`http://dice/get-seed`, { seedId }).then(data => data.data)
        )
      )
    ),
    wheelSeedLoader: new DataLoader(ids =>
      Promise.all(
        ids.map(seedId =>
          axios
            .post(`http://wheel/get-seed`, { seedId })
            .then(data => data.data)
        )
      )
    )
  };
};
