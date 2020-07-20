<template>
    <div>
        <details class="custom-block details">
            <summary>打赏一下</summary>
            <br>
            <p align="center" style="margin: -23% auto; transform: scale(0.5);"><img
                    :src="src"
                    width="400"
                    class="medium-zoom-image">
            </p>
            <p align="center">「真诚赞赏，手留余香」</p>
            <h3 id="打赏记录"><a href="#打赏记录" class="header-anchor">#</a> 打赏记录</h3>
            <table>
                <thead>
                <tr>
                    <th style="text-align: center;">打赏者</th>
                    <th style="text-align: center;">打助金额 (元)</th>
                    <th style="text-align: center;"> 支付方式</th>
                    <th style="text-align: center;">时间</th>
                    <th style="text-align: center;">备注</th>
                </tr>
                </thead>
                <tbody v-for="(item, index) in rewarder" :key="index">
                <tr>
                    <td style="text-align: center;"> {{item[0]}}</td>
                    <td style="text-align: center;"> {{item[1]}}</td>
                    <td style="text-align: center;"> {{item[2]}}</td>
                    <td style="text-align: center;"> {{item[3]}}</td>
                    <td style="text-align: center;"> {{item[4]}}</td>
                </tr>
                </tbody>
            </table>
        </details>
    </div>
</template>

<script>
    let rewarder = [
        // ['打赏者','打助金额','支付方式','时间','备注'],
        ['John', '12', '微信', '2020-06-09', 'tip of you'],
        ['艾斯', '32', '支付宝', '2020-07-11', '火拳赞赏']
    ]
    export default {
        name: "Reward",
        data() {
            return {
                rewarder,
                src: "/znote/vuepress/zanshang01.png"
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .details {
        margin: 5% auto 0 auto;
        width: 100%;
    }

    summary {
        background-color: #faebd7;
        text-align: center;
        margin: 0 auto;
        width: 150px;
    }

    table th:nth-of-type(1), th:nth-of-type(4), th:nth-of-type(5) {
        width: 23%;
    }
</style>
