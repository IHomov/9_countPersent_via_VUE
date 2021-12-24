import { createApp } from '../../node_modules/vue/dist/vue.esm-browser.js';

const URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/ovdp?json';
const URL_rates = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

const appConfig = {
   data() {
      return {
         partOne: {
            startTerm: "",
            finishTerm: ""
         },
         partTwo: {
            startTerm: "",
            finishTerm: ""
         },
         nburates: [],
         money: [],
      }
   },
   computed: {
      borrowedFirst() {
         return this.borrowed(this.partOne.startTerm, this.partOne.finishTerm, this.money)
      },
      backfirst() {
         return this.back(this.partOne.startTerm, this.partOne.finishTerm, this.money)
      },

      borrowedSec() {
         return this.borrowed(this.partTwo.startTerm, this.partTwo.finishTerm, this.money)
      },
      backSec() {
         return this.back(this.partTwo.startTerm, this.partTwo.finishTerm, this.money)
      },

      persBorrowed() {
         if (this.borrowedSec * this.borrowedFirst !== 0) {
            return Math.round(((this.borrowedSec - this.borrowedFirst) / this.borrowedFirst) * 100);
         }
      },
      persBack() {
         if (this.backSec * this.backfirst !== 0) {
            return Math.round(((this.backSec - this.backfirst) / this.backfirst) * 100);
         }
      }


   },

   async mounted() {

      let rates = await fetch(URL_rates);
      rates = await rates.json();
      this.nburates = rates;
      console.log('курсы nbu', this.nburates);


      let data = await fetch(URL);
      data = await data.json();
      data = data.map(item => {
         return {
            'valcode': item.valcode,
            'paydate': item.paydate,
            'repaydate': item.repaydate,
            'attraction': item.attraction
         }
      });

      for (let item of data) {
         for (let part of this.nburates) {
            if (item.valcode == part.cc) {
               item.attraction = item.attraction * part.rate;
               item.valcode = part.cc + " in UAH";
            }

         };
         item.attraction = Math.round(item.attraction);
         item.paydate = item.paydate.split('.').reverse().join('-');
         item.repaydate = item.repaydate.split('.').reverse().join('-');
      }
      this.money = data;


   },

   methods: {
      borrowed(startDate, finishDate, array) {
         let sum = 0;
         for (let item of array) {
            if (item.paydate >= startDate && item.paydate <= finishDate) {
               sum += item.attraction;
            }
         }
         return sum;
      },

      back(startDate, finishDate, array) {
         let sum = 0;
         for (let item of array) {
            if (item.repaydate >= startDate && item.repaydate <= finishDate) {
               sum += item.attraction;
            }
         } return sum;
      }
   }

}

createApp(appConfig).mount('#app');