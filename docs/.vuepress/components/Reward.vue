<template>
    <div class="reward-container">
        <div class="reward-button" @click="toggleReward">
            <svg width="18" height="18" viewBox="0 0 24 24" class="ZDI ZDI--Gift24" fill="currentColor"><path fill-rule="evenodd" d="M17.24 5.768c.522-2.089-1.397-3.968-3.474-3.401-.892.243-1.6.905-1.909 1.76a2.675 2.675 0 0 0-1.768-1.714C8.102 1.817 6.222 3.61 6.725 5.624l.172.689H4.796A2.546 2.546 0 0 0 2.25 8.859v1.814c0 .92.488 1.726 1.219 2.173v6.765a2.546 2.546 0 0 0 2.546 2.545h11.97a2.546 2.546 0 0 0 2.546-2.545v-6.765a2.544 2.544 0 0 0 1.219-2.173V8.86a2.546 2.546 0 0 0-2.546-2.546h-2.1l.135-.545Zm1.666 7.451H12.812v7.312h5.173a.92.92 0 0 0 .921-.92v-6.392Zm-7.718 0H5.094v6.392c0 .508.412.92.92.92H11.189V13.22Zm4.24-6.906h-2.415l.33-1.487a1.192 1.192 0 1 1 2.32.547l-.235.94Zm.634 1.625H19.204a.92.92 0 0 1 .921.92v1.815a.92.92 0 0 1-.92.921H4.794a.92.92 0 0 1-.92-.92V8.858a.92.92 0 0 1 .92-.921h11.268Zm-7.49-1.625h2.3l-.556-1.67a1.05 1.05 0 0 0-2.015.587l.27 1.083Z" clip-rule="evenodd"></path></svg>
            {{ isShow ? '收起赞赏' : '赞赏一下' }}
        </div>
        <div v-show="isShow" class="reward-content">
            <p align="center">
                <img :src="weChatAliPayQrcode" style="max-width: 200px; max-height: 250px;" />
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
        </div>
    </div>
</template>

<script>
    let rewarder = [
        // ['打赏者','打助金额','支付方式','时间','备注'],
        ['John', '12', '微信', '2020-06-09', ''],
        ['艾斯', '32', '支付宝', '2020-07-11', 'nice'],
        ['HickSalmon', '15', '微信', '2020-09-21', '有赏交流'],
    ]
    export default {
        name: "Reward",
        data() {
            return {
                rewarder,
                weChatAliPayQrcode: "/znote/reward/WeChatAliPayQrcode.png",
                isShow: false
            }
        },
        methods: {
            toggleReward() {
                this.isShow = !this.isShow
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .reward-container {
        margin: 5% auto -2% auto;
        width: 100%;
    }

    .reward-button {
        background-color: rgba(255,71,87,0.8);
        color: white;
        text-align: center;
        margin: 2% auto;
        width: 100px;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.8rem;
        font-weight: 500;
        border: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    
    .reward-button:hover {
        background-color: rgba(255,71,87,0.9);
    }

    table th:nth-of-type(1), th:nth-of-type(4), th:nth-of-type(5) {
        width: 22%;
    }
</style>
