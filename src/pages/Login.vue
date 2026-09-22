<template>
  <main class="login-page">
    <div class="decor decor-one"></div>
    <div class="decor decor-two"></div>

    <section class="login-intro">
      <div class="brand">
        <img class="brand-logo" src="~@/assets/logo.png" alt="朴朴鹰" />
        <div class="brand-copy">
          <strong>朴朴鹰</strong>
          <span>总部经营系统</span>
        </div>
      </div>

      <div class="intro-copy">
        <span class="eyebrow"><i></i> 一体化经营管理平台</span>
        <h2>让每一项业务<br />都有清晰的下一步</h2>
        <p>连接销售、财务、交付与人事，让数据可追踪、责任更清晰、协作更高效。</p>
      </div>

      <div class="preview-card">
        <div class="preview-head">
          <div><span></span><span></span><span></span></div>
          <small>经营数据概览</small>
        </div>
        <div class="preview-content">
          <div class="preview-metric"><i class="green"><a-icon type="team" /></i><span>在岗人数<strong>46</strong></span></div>
          <div class="preview-metric"><i class="blue"><a-icon type="file-done" /></i><span>执行项目<strong>18</strong></span></div>
          <div class="preview-metric"><i class="orange"><a-icon type="clock-circle" /></i><span>今日待办<strong>12</strong></span></div>
        </div>
        <div class="preview-chart"><span v-for="height in chartBars" :key="height" :style="{ height: height + '%' }"></span></div>
      </div>
    </section>

    <section class="login-panel">
      <div class="mobile-brand">
        <img class="brand-logo" src="~@/assets/logo.png" alt="朴朴鹰" />
        <strong>朴朴鹰</strong>
      </div>

      <div class="login-card" @keydown.enter="login">
        <div class="login-heading">
          <span class="welcome-icon"><a-icon type="user" /></span>
          <h1>朴朴鹰管理系统</h1>
          <p>欢迎回来，请登录您的管理账号</p>
        </div>

        <a-form-model ref="form" class="login-form" :model="form" :rules="rules">
          <label class="field-label">登录账号</label>
          <a-form-model-item prop="username" class="field-item">
            <a-input v-model="form.username" placeholder="请输入用户名" allow-clear>
              <a-icon slot="prefix" type="user" class="login-form-icon" />
            </a-input>
          </a-form-model-item>
          <label class="field-label">登录密码</label>
          <a-form-model-item prop="password" class="field-item">
            <a-input type="password" v-model="form.password" placeholder="请输入密码" allow-clear>
              <a-icon slot="prefix" type="lock" class="login-form-icon" />
            </a-input>
          </a-form-model-item>
          <a-button class="login-submit" size="large" type="primary" block :loading="loading" @click="login">
            登录系统 <a-icon v-if="!loading" type="arrow-right" />
          </a-button>
        </a-form-model>

        <p class="login-tip"><a-icon type="safety-certificate" /> 系统数据已加密保护，请妥善保管账号信息</p>
      </div>

      <div class="copyright">© 2026 朴朴鹰管理系统</div>
    </section>
  </main>
</template>

<script>
const rules = {
  username: [
    {
      required: true,
      message: "用户名不能为空！",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空！",
      trigger: "blur",
    },
  ],
};

export default {
  data() {
    return {
      chartBars: [32, 46, 38, 64, 52, 76, 68, 86, 72, 94],
      rules,
      loading: false,
      form: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    login() {
      this.loading = true;
      this.$refs.form
        .validate()
        .then(() => {
          return this.$auth.login({ ...this.form }).then(() => {
            this.$message.success("登录成功");
            this.$router.push("/");
          });
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>

<style lang="less" scoped>
.login-page { min-height: 100vh; position: relative; display: grid; grid-template-columns: minmax(520px,1.08fr) minmax(480px,.92fr); overflow: hidden; color: #0d1d3e; background: #f7fafc; }
.decor { position: absolute; border-radius: 50%; filter: blur(1px); pointer-events: none; }
.decor-one { width: 420px; height: 420px; left: -160px; bottom: -180px; background: rgba(8,168,141,.08); }
.decor-two { width: 260px; height: 260px; right: -100px; top: -90px; background: rgba(255,183,125,.16); }
.login-intro { position: relative; z-index: 1; min-height: 100vh; padding: 42px 8vw 52px; display: flex; flex-direction: column; border-right: 1px solid #e5ebf1; background: radial-gradient(circle at 15% 15%,#fff 0,#f2faf8 44%,#edf7f5 100%); }
.brand { display: flex; align-items: center; gap: 16px; }
.brand-logo { width: 58px; height: 58px; flex: 0 0 58px; border-radius: 14px; object-fit: cover; box-shadow: 0 10px 25px rgba(0,156,91,.16); }
.brand-copy { display: flex; flex-direction: column; }
.brand-copy strong { font-size: 27px; line-height: 1.2; letter-spacing: 2px; }
.brand-copy span { margin-top: 4px; color: #7d8aa1; font-size: 14px; }
.intro-copy { max-width: 640px; margin: 11vh 0 42px; }
.eyebrow { display: inline-flex; align-items: center; gap: 9px; color: #008f78; font-size: 15px; font-weight: 600; letter-spacing: 1px; }
.eyebrow i { width: 8px; height: 8px; border-radius: 50%; background: #08a88d; box-shadow: 0 0 0 6px rgba(8,168,141,.1); }
.intro-copy h2 { margin: 22px 0 18px; color: #0d1d3e; font-size: clamp(42px,4vw,66px); line-height: 1.18; letter-spacing: 1px; }
.intro-copy p { max-width: 580px; margin: 0; color: #6f7f98; font-size: 18px; line-height: 1.9; }
.preview-card { width: 100%; max-width: 620px; margin-top: auto; padding: 19px 22px 22px; border: 1px solid rgba(214,227,232,.9); border-radius: 18px; background: rgba(255,255,255,.83); box-shadow: 0 24px 65px rgba(27,74,70,.08); backdrop-filter: blur(12px); }
.preview-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 1px solid #edf1f4; }
.preview-head div { display: flex; gap: 6px; }.preview-head div span { width: 8px; height: 8px; border-radius: 50%; background: #ffb77d; }.preview-head div span:nth-child(2) { background: #ffd56a; }.preview-head div span:nth-child(3) { background: #45cdb5; }
.preview-head small { color: #8491a7; }
.preview-content { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; padding: 18px 0 15px; }
.preview-metric { min-width: 0; display: flex; align-items: center; gap: 11px; }
.preview-metric i { width: 38px; height: 38px; flex: 0 0 38px; border-radius: 50%; display: grid; place-items: center; font-size: 17px; font-style: normal; }.preview-metric i.green { color: #00a286; background: #e3f8f3; }.preview-metric i.blue { color: #3478df; background: #eaf2ff; }.preview-metric i.orange { color: #e9920b; background: #fff2dd; }
.preview-metric span { color: #7e8ba1; font-size: 12px; }.preview-metric strong { display: block; margin-top: 2px; color: #142341; font-size: 20px; }
.preview-chart { height: 66px; display: flex; align-items: flex-end; gap: 9px; padding: 0 4px; border-bottom: 1px solid #e8eef2; }
.preview-chart span { flex: 1; min-width: 8px; border-radius: 5px 5px 0 0; background: linear-gradient(180deg,#18b99f,#08a88d); opacity: .82; }
.login-panel { position: relative; z-index: 1; min-height: 100vh; padding: 40px 7vw; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,.8); }
.mobile-brand { display: none; }
.login-card { width: 100%; max-width: 440px; padding: 44px 42px 38px; border: 1px solid #e5ebf1; border-radius: 20px; background: #fff; box-shadow: 0 24px 70px rgba(22,42,78,.08); }
.login-heading { text-align: center; margin-bottom: 30px; }
.welcome-icon { width: 54px; height: 54px; margin: 0 auto 17px; border-radius: 15px; display: grid; place-items: center; color: #009c82; font-size: 23px; background: #e8f8f5; }
.login-heading h1 { margin: 0 0 9px; color: #0d1d3e; font-size: 29px; letter-spacing: 1px; }
.login-heading p { margin: 0; color: #8591a6; font-size: 14px; }
.field-label { display: block; margin: 0 0 8px; color: #273754; font-size: 14px; font-weight: 600; }
.field-item { margin-bottom: 21px; }
.login-form /deep/ .ant-input-affix-wrapper .ant-input { height: 50px; padding-left: 42px; border-color: #dfe6ed; border-radius: 9px; color: #152541; font-size: 15px; background: #fbfcfd; transition: all .2s; }
.login-form /deep/ .ant-input-affix-wrapper .ant-input:hover,.login-form /deep/ .ant-input-affix-wrapper .ant-input:focus { border-color: #08a88d; background: #fff; box-shadow: 0 0 0 3px rgba(8,168,141,.09); }
.login-form /deep/ .ant-input-prefix { left: 15px; }
.login-form-icon { color: #91a0b4; font-size: 17px; }
.login-submit { height: 52px; margin-top: 5px; border: 0; border-radius: 9px; font-size: 16px; font-weight: 600; letter-spacing: 1px; background: linear-gradient(135deg,#08a98f,#008f78); box-shadow: 0 12px 24px rgba(8,168,141,.2); }
.login-submit:hover,.login-submit:focus { background: linear-gradient(135deg,#0bb99d,#00967e); }
.login-submit .anticon { margin-left: 7px; }
.login-tip { margin: 27px 0 0; padding-top: 20px; border-top: 1px solid #edf1f4; color: #929eb0; text-align: center; font-size: 12px; }.login-tip .anticon { margin-right: 5px; color: #08a88d; }
.copyright { position: absolute; bottom: 26px; color: #9aa5b6; font-size: 12px; }
@media (max-width: 980px) { .login-page { grid-template-columns: 1fr; }.login-intro { display: none; }.login-panel { padding: 92px 24px 70px; background: radial-gradient(circle at 50% 0,#fff 0,#f1faf8 55%,#f7fafc 100%); }.mobile-brand { position: absolute; top: 28px; left: 30px; display: flex; align-items: center; gap: 12px; color: #0d1d3e; font-size: 22px; }.mobile-brand .brand-logo { width: 44px; height: 44px; flex-basis: 44px; border-radius: 11px; } }
@media (max-width: 520px) { .login-card { padding: 34px 24px 30px; border-radius: 16px; }.login-heading h1 { font-size: 25px; }.copyright { bottom: 18px; } }
</style>
