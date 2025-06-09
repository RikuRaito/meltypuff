import React from "react";
import "./Hyoki.css";

const Hyoki = () => {
  return (
    <div className="hyoki-container">
      <h2 className="hyoki-title">特定商取引法に基づく表記</h2>
      <table className="hyoki-table">
        <tbody>
          <tr>
            <th>販売業者</th>
            <td>斉藤実功（屋号：Melty Puff）</td>
          </tr>
          <tr>
            <th>販売責任者名</th>
            <td>斉藤実功（屋号：Melty Puff）</td>
          </tr>
          <tr>
            <th>所在地</th>
            <td>〒920-0941 石川県金沢市旭町 3-14-11 Winelight103</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>080-3747-0649</td>
          </tr>
          <tr>
            <th>電話受付時間</th>
            <td>10:00～16:00（平日のみ）</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>support@meltypuff.com</td>
          </tr>
          <tr>
            <th>サイトURL</th>
            <td>https://www.meltypuff.com/the_vape/</td>
          </tr>
          <tr>
            <th>商品の販売価格</th>
            <td>各商品ページをご参照ください。</td>
          </tr>
          <tr>
            <th>商品代金以外に必要な料金</th>
            <td>
              ノンニコチンベイプ（250円）<br />
              ニコチンベイプ（無料）
            </td>
          </tr>
          <tr>
            <th>支払い方法</th>
            <td>
              クレジットカードのみ<br />
              ※クレジットカード：商品注文時にお支払いが確定します。
            </td>
          </tr>
          <tr>
            <th>商品の引き渡し時期</th>
            <td>ご注文から2〜3営業日以内に発送いたします。</td>
          </tr>
          <tr>
            <th>返品・交換</th>
            <td>
              ご注文内容と異なる、不良品の場合を除き、返品・キャンセルは承れません。<br />
              万が一商品に欠陥がある場合は、商品到着後7日以内にメールまたはお電話にてご連絡ください。
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Hyoki;