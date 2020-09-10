import { getDimensions } from '../mockRequest';
test('测试维度获取', (done) => {
  getDimensions().then((res) => {
    expect(JSON.stringify(res.data)).toBe(
      '["单据日期","地区名称","业务员名称","客户分类","客户名称","存货名称","部门名称","存货分类"]'
    );
    done();
  });
});
