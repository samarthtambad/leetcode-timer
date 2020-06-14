<template>
  <div>
    <h3>Set default time for each difficulty level</h3>
    <div>
      <h3>Easy</h3>
      <vue-timepicker id="time-easy" :format="timeFormat" v-model="timeEasy" close-on-complete hide-clear-button></vue-timepicker>
      <h3>Medium</h3>
      <vue-timepicker id="time-medium" :format="timeFormat" v-model="timeMedium" close-on-complete hide-clear-button></vue-timepicker>
      <h3>Hard</h3>
      <vue-timepicker id="time-hard" :format="timeFormat" v-model="timeHard" close-on-complete hide-clear-button></vue-timepicker>
    </div>
    <button id="save" @click="saveOptions">Save</button>
    <span id="status"></span>
  </div>
</template>

<script>
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue';
export default {
  name: 'App',
  components: { VueTimepicker },
  data() {
    return {
      timeFormat: 'mm:ss',
      timeEasy: {
        mm: undefined,
        ss: undefined,
      },
      timeMedium: {
        mm: undefined,
        ss: undefined,
      },
      timeHard: {
        mm: undefined,
        ss: undefined,
      },
    };
  },
  computed: {
    timeEasyComputed: function() {
      var min = parseInt(this.timeEasy.mm);
      var sec = parseInt(this.timeEasy.ss);
      return min * 60 + sec;
    },
    timeMediumComputed: function() {
      var min = parseInt(this.timeMedium.mm);
      var sec = parseInt(this.timeMedium.ss);
      return min * 60 + sec;
    },
    timeHardComputed: function() {
      var min = parseInt(this.timeHard.mm);
      var sec = parseInt(this.timeHard.ss);
      return min * 60 + sec;
    },
  },
  methods: {
    // Saves options to chrome.storage
    saveOptions() {
      console.log('saveOptions');
      chrome.storage.sync.set(
        {
          easy: this.timeEasyComputed,
          medium: this.timeMediumComputed,
          hard: this.timeHardComputed,
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
          easy: 900,
          medium: 1200,
          hard: 1800,
        },
        function(items) {
          console.log(items);
          var valEasy = {
            mm: Math.floor(items.easy / 60)
              .toString()
              .padStart(2, '0'),
            ss: (items.easy % 60).toString().padStart(2, '0'),
          };
          this.timeEasy = valEasy;
          var valMedium = {
            mm: Math.floor(items.medium / 60)
              .toString()
              .padStart(2, '0'),
            ss: (items.medium % 60).toString().padStart(2, '0'),
          };
          this.timeMedium = valMedium;
          var valHard = {
            mm: Math.floor(items.hard / 60)
              .toString()
              .padStart(2, '0'),
            ss: (items.hard % 60).toString().padStart(2, '0'),
          };
          this.timeHard = valHard;

          document.getElementById('time-easy').value = this.timeEasy.mm + ':' + this.timeEasy.ss;
          document.getElementById('time-medium').value = this.timeMedium.mm + ':' + this.timeMedium.ss;
          document.getElementById('time-hard').value = this.timeHard.mm + ':' + this.timeHard.ss;
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
