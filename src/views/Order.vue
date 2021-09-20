<template>
  <div>
    <div class="mb-5">
      <div v-if="order_history.length > 0">
        <h2>Oder History</h2>

        <ul>
          <li v-for="item in order_history" :key="item.pizzaId">
            {{item.pizzaName}}<br>
            {{item.date}}
          </li>
        </ul>
      </div>
      <h2>Oder Pizza</h2>
      <ul>
        <li v-for="piz in pizza" :key="piz.pizzaId">
          {{piz.pizzaName}}
          <button @click.prevent="addPizza(piz.pizzaName,piz.pizzaId)">Add to cart</button>
        </li>
      </ul>

      <div v-if="order.length > 0">
        <h2>Your order:</h2>
        <ul>
          <li v-for="item in order" :key="item.pizzaId">
            {{item.pizzaName}}
          </li>
        </ul>

      

        <p v-if="!$auth.user.email_verified">
          Please validate your email before ordering.
        </p>

        <button class="btn btn-primary mt-5" :disabled="!$auth.user.email_verified || order.length === 0" @click.prevent="callApi">Place Order</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  h2{
    margin-top:20px
  }
  .hide{
    display: none
  }
  ul{
    width: 100%;
    float: left
  }
  li{
    list-style: none;
    width: 100%;
    float: left;
    margin: 5px 0;
    padding: 0
  }

  li button{
    float: right;
  }
</style>

<script>
export default {
  name: "Order",
  data() {
    return {
      apiMessage: null,
      executed: false,
      pizza: [
        {pizzaName: "Magharita", pizzaId: 1},
        {pizzaName: "Pizza Marinara", pizzaId: 2},
        {pizzaName: "Marinara", pizzaId: 3},
        {pizzaName: "Quattro Stagioni", pizzaId: 4},
        {pizzaName: "Carbonara", pizzaId: 5},
        {pizzaName: "Frutti di Mare", pizzaId: 6},
        {pizzaName: "Quattro Formaggi", pizzaId: 7},
        {pizzaName: "Crudo", pizzaId: 8},
        {pizzaName: "Napoletana or Napoli", pizzaId: 9},
        {pizzaName: "Pugliese", pizzaId: 10},
        {pizzaName: "Montanara", pizzaId: 11}
      ],
      order_history: this.$auth.user[location.origin + "/order_history"] || null,
      order: []
    };
  },
  methods: {
    addPizza(pizzaName, pizzaId){
      this.order.push({
        pizzaName,
        pizzaId,
        date: new Date().toISOString()
      });
    },

    async callApi() {
      const accessToken = await this.$auth.getTokenSilently();
      const orders = this.order_history ? this.order_history.concat(this.order) : this.order;

      try {
        const { data } = await this.$http.post("/place/order",{
            orders
          }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          } 
        });

        this.apiMessage = data;
        this.executed = true;
        this.order = [];
        this.order_history = orders;

        alert(this.apiMessage);
      } catch (e) {
        this.apiMessage = `Error: the server responded with '${e.response.status}: ${e.response.statusText}'`;
        alert(this.apiMessage);
      }
    }
  }
};
</script>
