<template>
  <div>
    <h3>Set default time for each difficulty level</h3>
    <div>
      <h3>Easy</h3>
      <input id="time-easy" v-model="timeEasy" placeholder="time (mins)" />
      <h3>Medium</h3>
      <input id="time-medium" v-model="timeMedium" placeholder="time (mins)" />
      <h3>Hard</h3>
      <input id="time-hard" v-model="timeHard" placeholder="time (mins)" />
    </div>
    <button id="save" @click="saveOptions">Save</button>
    <span id="status"></span>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      timeEasy: '15',
      timeMedium: '20',
      timeHard: '30',
    };
  },
  methods: {
    // Saves options to chrome.storage
    saveOptions() {
      console.log('saveOptions');
      chrome.storage.sync.set(
        {
          timeEasy: this.timeEasy,
          timeMedium: this.timeMedium,
          timeHard: this.timeHard,
        },
        function() {
          // Update status to let user know options were saved.
          console.log('Successfully saved options');
          var status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 750);
        }
      );
    },
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    restoreOptions() {
      console.log('restoreOptions');
      chrome.storage.sync.get(
        {
          timeEasy: '15',
          timeMedium: '20',
          timeHard: '30',
        },
        function(items) {
          this.timeEasy = items.timeEasy;
          this.timeMedium = items.timeMedium;
          this.timeHard = items.timeHard;
          document.getElementById('time-easy').value = this.timeEasy;
          document.getElementById('time-medium').value = this.timeMedium;
          document.getElementById('time-hard').value = this.timeHard;
        }
      );
    },
  },
  mounted() {
    this.restoreOptions();
  },
};
</script>

<style scoped>
p {
  font-size: 20px;
}
button {
  margin: 1em 0px;
}
</style>
