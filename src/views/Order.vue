<template>
  <div>
    <div class="mb-5">
      <div v-if="orderHistory.length > 0">
        <h2>Oder History</h2>

        <ul>
          <li v-for="item in orderHistory" :key="item.pizzaId">
            {{item.pizzaName}}<br>
            {{item.date}}
          </li>
        </ul>

        <button class="simple" @click="removeHistory">Remove History</button>
      </div>
      <h2>Oder Pizza</h2>
      <ul class="hover">
        <li v-for="piz in pizza" :key="piz.pizzaId">
          {{piz.pizzaName}}
          <button v-if="$auth.isAuthenticated" class="simple" @click="addPizza(piz.pizzaName,piz.pizzaId)">Add to cart</button>
        </li>
      </ul>

      <div v-if="order.length > 0">
        <h2>Your order:</h2>
        <ul class="hover">
          <li v-for="(item, index) in order" :key="item.pizzaId">
            {{index+1}}. {{item.pizzaName}}
            <button class="simple" @click="order.splice(index, 1)">Remove</button>
          </li>
        </ul>

      

        <p v-if="!$auth.user.email_verified">
          Please validate your email before ordering.
        </p>

        <button class="btn btn-primary" :disabled="!$auth.user.email_verified || order.length === 0" @click.prevent="placeOrder">Place Order</button>
      </div>
      <button v-if="!$auth.isAuthenticated && !$auth.loading" @click="login" id="qsLoginBtn" class="btn btn-primary btn-margin">Login to place an order!</button>
    </div>
  </div>
</template>

<style scoped>
  button.simple{
    border: 2px solid #000;
    border-radius: 3px;
    background-color: transparent;
    color: #000;
    transition: all .3s;
  }

  button.simple:hover{
    background-color: #000;
    color: #fff
  }

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
    padding: 10px;
    line-height: 20px;
    transition: all .3s;
  }

  ul.hover li:hover{
    background-color: #f8f8f8;
  }

  .btn-primary{
    background-color: #000;
    border-color: #000;
  }

  .btn-primary:active,
  .btn-primary:focus{
    background-color: #000 !important;
    border-color: #000 !important;
  }

  li button{
    float: right;
  }
</style>

<script>
import { getInstance } from "../auth/authWrapper";

export default {
  name: "Order",
  data() {
    return {
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
      orderHistory: [],
      order: [],
    };
  },
  created() {
    this.init(this.loadUser);
  },
  methods: {
    init(fn) {
      const instance = getInstance();
      instance.$watch("loading", loading => {
          if (loading === false) {
              fn(instance);
          }
      });
    },
    async loadUser(instance) {
      await instance.getTokenSilently().then(() => {
        this.orderHistory = instance.isAuthenticated && instance.user["https://pizza-delivery-demo-pfieger.herokuapp.com/order_history"] || [];
      });
    },
    login(){
      this.$auth.loginWithRedirect({
        redirect_uri: location.origin + "/order"
      });
    },
    addPizza(pizzaName, pizzaId){
      this.order.push({
        pizzaName,
        pizzaId,
        date: new Date().toISOString()
      });
    },
    async removeHistory(){
      if(!confirm("Do you really want to remove your history?")){
        return false;
      }

      const accessToken = await this.$auth.getTokenSilently();

      try {
        const { data } = await this.$http.patch("/remove/history",{}, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          } 
        });

        this.orderHistory = [];
        
        alert(data);
      } catch (e) {
        alert(`Error: the server responded with '${e.response.status}: ${e.response.statusText} ${JSON.stringify(e)}'`);
      }
    },
    async placeOrder() {
      const accessToken = await this.$auth.getTokenSilently();
      const orders = this.orderHistory ? this.orderHistory.concat(this.order) : this.order;

      try {
        const { data } = await this.$http.patch("/place/order",{
            orders
          }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          } 
        });

        this.order = [];
        this.orderHistory = orders;

        alert(data);
      } catch (e) {      
        alert(e.response.data || `Error: the server responded with '${e.response.status}: ${e.response.statusText} ${JSON.stringify(e.response.data)}`);
      }
    }
  }
};
</script>
